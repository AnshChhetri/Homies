// ============================================================
// GROUPS CONTROLLER — Firestore data layer (collection: groups)
// Inject Firestore via init(YOUR_FIRESTORE_VAR) before use.
// ============================================================

const GroupsController = (function () {
    const COLLECTION = 'groups';
    const MESSAGES_SUB = 'messages';
    let firestore = null;

    function init(YOUR_FIRESTORE_VAR) {
        if (!YOUR_FIRESTORE_VAR) {
            throw new Error('GroupsController.init requires a Firestore instance.');
        }
        firestore = YOUR_FIRESTORE_VAR;
    }

    function assertReady() {
        if (!firestore) {
            throw new Error('GroupsController is not initialized. Call GroupsController.init(db) first.');
        }
    }

    function groupsRef() {
        assertReady();
        return firestore.collection(COLLECTION);
    }

    function groupDocRef(groupId) {
        return groupsRef().doc(groupId);
    }

    function messagesRef(groupId) {
        return groupDocRef(groupId).collection(MESSAGES_SUB);
    }

    function normalizeGroupDoc(id, data) {
        const raw = data || {};
        return {
            id,
            name: raw.name || 'Untitled Circle',
            description: raw.description || '',
            createdBy: raw.createdBy || '',
            creatorName: raw.creatorName || 'Homie',
            createdAt: raw.createdAt || null,
            institutionDomain: (raw.institutionDomain || '').trim().toLowerCase(),
            members: Array.isArray(raw.members) ? raw.members : [],
            pendingRequests: Array.isArray(raw.pendingRequests) ? raw.pendingRequests : []
        };
    }

    function normalizeMessageDoc(id, data) {
        const raw = data || {};
        return {
            id,
            senderId: raw.senderId || '',
            senderName: raw.senderName || 'Homie',
            text: raw.text || '',
            createdAt: raw.createdAt || null
        };
    }

    function isMember(group, uid) {
        return Boolean(uid && group && Array.isArray(group.members) && group.members.includes(uid));
    }

    function hasPendingRequest(group, uid) {
        return Boolean(uid && group && Array.isArray(group.pendingRequests) && group.pendingRequests.includes(uid));
    }

    function isCreator(group, uid) {
        return Boolean(uid && group && group.createdBy === uid);
    }

    function memberCount(group) {
        return group && Array.isArray(group.members) ? group.members.length : 0;
    }

    async function fetchUserProfiles(uids) {
        assertReady();
        const unique = [...new Set((uids || []).filter(Boolean))];
        const profiles = {};

        await Promise.all(unique.map(async uid => {
            try {
                const snap = await firestore.collection('users').doc(uid).get();
                if (snap.exists) {
                    const data = snap.data();
                    profiles[uid] = (data.fullName || data.displayName || 'Homie').trim();
                } else {
                    profiles[uid] = 'Homie';
                }
            } catch (err) {
                console.error('[GroupsController] profile fetch failed:', uid, err);
                profiles[uid] = 'Homie';
            }
        }));

        return profiles;
    }

    async function createGroup({ name, description, institutionDomain, user }) {
        if (!user || !user.uid) throw new Error('A signed-in user is required to create a group.');

        const trimmedName = (name || '').trim();
        const trimmedDescription = (description || '').trim();
        const trimmedDomain = (institutionDomain || '').trim().toLowerCase();

        if (!trimmedName) throw new Error('Group name is required.');
        if (!trimmedDomain) throw new Error('Institution domain is required.');

        const payload = {
            name: trimmedName,
            description: trimmedDescription,
            createdBy: user.uid,
            creatorName: (user.displayName || 'Homie').trim(),
            institutionDomain: trimmedDomain,
            members: [user.uid],
            pendingRequests: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        return groupsRef().add(payload);
    }

    async function requestJoin(groupId, uid) {
        if (!groupId || !uid) throw new Error('Group id and user id are required.');
        return groupDocRef(groupId).update({
            pendingRequests: firebase.firestore.FieldValue.arrayUnion(uid)
        });
    }

    async function acceptJoinRequest(groupId, uid) {
        if (!groupId || !uid) throw new Error('Group id and applicant uid are required.');

        const docRef = groupDocRef(groupId);
        return firestore.runTransaction(async transaction => {
            const snap = await transaction.get(docRef);
            if (!snap.exists) throw new Error('Group not found.');

            const data = snap.data();
            const pending = Array.isArray(data.pendingRequests) ? data.pendingRequests : [];
            if (!pending.includes(uid)) {
                throw new Error('Applicant is not in pending requests.');
            }

            transaction.update(docRef, {
                pendingRequests: firebase.firestore.FieldValue.arrayRemove(uid),
                members: firebase.firestore.FieldValue.arrayUnion(uid)
            });
        });
    }

    async function denyJoinRequest(groupId, uid) {
        if (!groupId || !uid) throw new Error('Group id and applicant uid are required.');
        return groupDocRef(groupId).update({
            pendingRequests: firebase.firestore.FieldValue.arrayRemove(uid)
        });
    }

    async function leaveGroup(groupId, uid) {
        if (!groupId || !uid) throw new Error('Group id and user id are required.');
        return groupDocRef(groupId).update({
            members: firebase.firestore.FieldValue.arrayRemove(uid),
            pendingRequests: firebase.firestore.FieldValue.arrayRemove(uid)
        });
    }

    async function sendGroupMessage(groupId, user, text) {
        if (!groupId || !user || !user.uid) throw new Error('Group id and user are required.');
        const trimmed = (text || '').trim();
        if (!trimmed) throw new Error('Message text is required.');

        return messagesRef(groupId).add({
            senderId: user.uid,
            senderName: (user.displayName || 'Homie').trim(),
            text: trimmed,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    function subscribeCampusGroups(institutionDomain, onUpdate, onError) {
        const domain = (institutionDomain || '').trim().toLowerCase();
        if (!domain) {
            onUpdate([]);
            return function noopUnsubscribe() {};
        }

        return groupsRef()
            .where('institutionDomain', '==', domain)
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                snapshot => {
                    const groups = [];
                    snapshot.forEach(doc => {
                        groups.push(normalizeGroupDoc(doc.id, doc.data()));
                    });
                    onUpdate(groups);
                },
                err => {
                    if (typeof onError === 'function') onError(err);
                }
            );
    }

    function subscribeGroupMessages(groupId, onUpdate, onError) {
        if (!groupId) {
            onUpdate([]);
            return function noopUnsubscribe() {};
        }

        return messagesRef(groupId)
            .orderBy('createdAt', 'asc')
            .onSnapshot(
                snapshot => {
                    const messages = [];
                    snapshot.forEach(doc => {
                        messages.push(normalizeMessageDoc(doc.id, doc.data()));
                    });
                    onUpdate(messages);
                },
                err => {
                    if (typeof onError === 'function') onError(err);
                }
            );
    }

    return {
        COLLECTION,
        MESSAGES_SUB,
        init,
        normalizeGroupDoc,
        normalizeMessageDoc,
        isMember,
        hasPendingRequest,
        isCreator,
        memberCount,
        fetchUserProfiles,
        createGroup,
        requestJoin,
        acceptJoinRequest,
        denyJoinRequest,
        leaveGroup,
        sendGroupMessage,
        subscribeCampusGroups,
        subscribeGroupMessages
    };
})();

window.GroupsController = GroupsController;
