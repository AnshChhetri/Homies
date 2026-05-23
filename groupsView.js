// ============================================================
// GROUPS VIEW — Campus circles dashboard + admin + group chat
// Uses GroupsController with YOUR_FIRESTORE_VAR / YOUR_USER_VAR.
// ============================================================

const GroupsView = (function () {
    let rootEl = null;
    let getFirestore = null;
    let getCurrentUser = null;
    let resolveInstitutionDomain = null;
    let onDomainResolved = null;

    let mounted = false;
    let isActive = false;
    let groupsUnsubscribe = null;
    let messagesUnsubscribe = null;

    let institutionDomain = null;
    let groupsCache = [];
    let expandedGroupId = null;
    let activeChatGroupId = null;
    let chatMessagesCache = [];

    const actionPending = new Set();
    const adminActionPending = new Set();
    const applicantNameCache = {};

    let els = {};

    function getUser() {
        return getCurrentUser ? getCurrentUser() : null;
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatCampusDisplayName(domain) {
        if (!domain) return 'Your Campus';
        const slug = domain.split('.')[0] || domain;
        const label = slug.replace(/[-_]/g, ' ');
        return label.charAt(0).toUpperCase() + label.slice(1) + ' Campus';
    }

    function getGroupById(groupId) {
        return groupsCache.find(g => g.id === groupId) || null;
    }

    function refreshIcons() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }

    function mountDashboardShell() {
        if (!rootEl || mounted) return;
        mounted = true;

        rootEl.innerHTML = `
            <div id="groupsDashboardChrome">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                    <div class="space-y-1">
                        <span class="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                            <i data-lucide="circle-dot" class="w-3 h-3"></i> Campus Circles
                        </span>
                        <h2 id="groupsCampusTitle" class="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight font-heading">Your Campus</h2>
                        <p id="groupsCampusSubtitle" class="text-xs text-slate-400 max-w-md">Request access to circles on your campus domain.</p>
                    </div>
                    <div class="flex items-center gap-3 self-start md:self-auto">
                        <span id="groupsDomainPill" class="hidden bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wide border border-slate-200"></span>
                        <button id="groupsCreateBtn" type="button" class="hidden bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs uppercase tracking-wide shadow-md flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Create Circle
                        </button>
                    </div>
                </div>
            </div>
            <div id="groupsGrid" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8" aria-live="polite"></div>
            <div id="groupsChatPanel" class="hidden mt-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[420px] max-h-[70vh]">
                <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <button type="button" id="groupsChatBackBtn" class="text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-blue-700 flex items-center gap-1 focus:outline-none">
                        <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back
                    </button>
                    <div class="text-center min-w-0 flex-1">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Group Chat</p>
                        <h3 id="groupsChatTitle" class="text-sm font-extrabold text-slate-900 truncate">Circle</h3>
                    </div>
                    <span class="w-12"></span>
                </div>
                <div id="groupsChatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 min-h-[240px]"></div>
                <form id="groupsChatForm" class="flex gap-2 p-3 border-t border-slate-100 bg-white">
                    <input type="text" id="groupsChatInput" maxlength="500" placeholder="Message your circle…" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-400" autocomplete="off" />
                    <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wide shadow-sm focus:outline-none">Send</button>
                </form>
            </div>
            <div id="groupsCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="groupsModalTitle">
                <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
                    <button id="groupsModalCloseBtn" type="button" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg focus:outline-none" aria-label="Close">&times;</button>
                    <h3 id="groupsModalTitle" class="text-lg font-extrabold text-blue-950 text-center tracking-tight mb-1">Create a Circle</h3>
                    <p id="groupsModalHint" class="text-[10px] text-slate-400 text-center mb-4"></p>
                    <form id="groupsCreateForm" class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" for="groupsInputName">Circle Name</label>
                            <input type="text" id="groupsInputName" required maxlength="80" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-400" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" for="groupsInputDescription">Description</label>
                            <textarea id="groupsInputDescription" rows="3" maxlength="400" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-blue-400"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition uppercase tracking-wide shadow-md">Publish Circle</button>
                    </form>
                </div>
            </div>
        `;

        els = {
            dashboardChrome: rootEl.querySelector('#groupsDashboardChrome'),
            campusTitle: rootEl.querySelector('#groupsCampusTitle'),
            campusSubtitle: rootEl.querySelector('#groupsCampusSubtitle'),
            domainPill: rootEl.querySelector('#groupsDomainPill'),
            createBtn: rootEl.querySelector('#groupsCreateBtn'),
            grid: rootEl.querySelector('#groupsGrid'),
            chatPanel: rootEl.querySelector('#groupsChatPanel'),
            chatBackBtn: rootEl.querySelector('#groupsChatBackBtn'),
            chatTitle: rootEl.querySelector('#groupsChatTitle'),
            chatMessages: rootEl.querySelector('#groupsChatMessages'),
            chatForm: rootEl.querySelector('#groupsChatForm'),
            chatInput: rootEl.querySelector('#groupsChatInput'),
            modal: rootEl.querySelector('#groupsCreateModal'),
            modalClose: rootEl.querySelector('#groupsModalCloseBtn'),
            modalHint: rootEl.querySelector('#groupsModalHint'),
            createForm: rootEl.querySelector('#groupsCreateForm'),
            inputName: rootEl.querySelector('#groupsInputName'),
            inputDescription: rootEl.querySelector('#groupsInputDescription')
        };

        els.createBtn.addEventListener('click', openCreateModal);
        els.modalClose.addEventListener('click', closeCreateModal);
        els.createForm.addEventListener('submit', handleCreateSubmit);
        els.modal.addEventListener('click', e => {
            if (e.target === els.modal) closeCreateModal();
        });
        els.chatBackBtn.addEventListener('click', closeChatPanel);
        els.chatForm.addEventListener('submit', handleChatSubmit);

        refreshIcons();
    }

    function updateHeaderChrome() {
        const user = getUser();
        const domain = institutionDomain;
        const campusName = formatCampusDisplayName(domain);

        if (els.campusTitle) els.campusTitle.textContent = campusName;
        if (els.campusSubtitle) {
            els.campusSubtitle.textContent = domain
                ? `Circles for @${domain} — request access or chat with approved members.`
                : 'Sign in with your school email to discover circles on your campus.';
        }

        if (els.domainPill) {
            if (domain && user) {
                els.domainPill.textContent = `@${domain}`;
                els.domainPill.classList.remove('hidden');
            } else {
                els.domainPill.classList.add('hidden');
            }
        }

        if (els.createBtn) {
            if (domain && user) els.createBtn.classList.remove('hidden');
            else els.createBtn.classList.add('hidden');
        }

        if (els.modalHint) {
            els.modalHint.textContent = domain
                ? `Only @${domain} students can see and request this circle.`
                : '';
        }
    }

    function getPrimaryActionState(group, uid) {
        if (!uid) return { label: 'Log In to Request', disabled: true, variant: 'muted', action: 'none' };
        if (GroupsController.isCreator(group, uid)) {
            return { label: 'Your Circle', disabled: true, variant: 'muted', action: 'none' };
        }
        if (GroupsController.isMember(group, uid)) {
            return { label: 'Leave Circle', disabled: false, variant: 'leave', action: 'leave' };
        }
        if (GroupsController.hasPendingRequest(group, uid)) {
            return { label: 'Requested / Pending', disabled: true, variant: 'pending', action: 'none' };
        }
        return { label: 'Request to Join', disabled: false, variant: 'request', action: 'request' };
    }

    function actionButtonClasses(variant) {
        switch (variant) {
            case 'leave':
                return 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200';
            case 'pending':
                return 'bg-amber-50 text-amber-800 border border-amber-200 cursor-default';
            case 'muted':
                return 'bg-slate-50 text-slate-400 border border-slate-100 cursor-default';
            default:
                return 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm border border-transparent';
        }
    }

    function buildAdminConsoleShell(group) {
        const pendingCount = group.pendingRequests.length;
        return `
            <div class="groups-admin-console rounded-xl border border-violet-200 bg-violet-50/60 p-4 space-y-3" data-admin-group="${group.id}">
                <div class="flex items-center gap-2">
                    <i data-lucide="shield" class="w-4 h-4 text-violet-600"></i>
                    <h4 class="text-[10px] font-black uppercase tracking-wider text-violet-800">Creator Admin Console</h4>
                </div>
                <div class="groups-admin-list space-y-2" data-admin-list="${group.id}">
                    ${pendingCount
                        ? '<p class="text-[10px] text-violet-600 animate-pulse">Loading applicants…</p>'
                        : '<p class="text-xs text-violet-700/80 italic">No pending join requests.</p>'}
                </div>
            </div>
        `;
    }

    async function hydrateAdminConsole(group) {
        if (!GroupsController.isCreator(group, getUser()?.uid)) return;

        const listEl = els.grid.querySelector(`[data-admin-list="${group.id}"]`);
        if (!listEl) return;

        const uids = group.pendingRequests || [];
        if (!uids.length) {
            listEl.innerHTML = '<p class="text-xs text-violet-700/80 italic">No pending join requests.</p>';
            return;
        }

        const profiles = await GroupsController.fetchUserProfiles(uids);
        Object.assign(applicantNameCache, profiles);

        listEl.innerHTML = uids.map(uid => {
            const busy = adminActionPending.has(`${group.id}:${uid}`);
            const name = escapeHtml(profiles[uid] || 'Homie');
            return `
                <div class="flex items-center justify-between gap-2 bg-white/80 border border-violet-100 rounded-lg px-3 py-2">
                    <span class="text-xs font-semibold text-slate-700 truncate">${name}</span>
                    <div class="flex gap-1.5 shrink-0">
                        <button type="button" class="groups-accept-btn text-[9px] font-bold uppercase px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50" data-group-id="${group.id}" data-applicant-uid="${uid}" ${busy ? 'disabled' : ''}>Accept</button>
                        <button type="button" class="groups-deny-btn text-[9px] font-bold uppercase px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50" data-group-id="${group.id}" data-applicant-uid="${uid}" ${busy ? 'disabled' : ''}>Deny</button>
                    </div>
                </div>
            `;
        }).join('');

        listEl.querySelectorAll('.groups-accept-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAcceptApplicant(btn.dataset.groupId, btn.dataset.applicantUid));
        });
        listEl.querySelectorAll('.groups-deny-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDenyApplicant(btn.dataset.groupId, btn.dataset.applicantUid));
        });

        refreshIcons();
    }

    function buildExpandedPanel(group, uid) {
        const isMember = GroupsController.isMember(group, uid);
        const isCreator = GroupsController.isCreator(group, uid);
        const isExpanded = expandedGroupId === group.id;

        if (!isExpanded) return '';

        return `
            <div class="groups-expanded-panel border-t border-slate-100 pt-4 mt-3 space-y-3">
                ${isCreator ? buildAdminConsoleShell(group) : ''}
                ${isMember ? `
                    <button type="button" class="groups-open-chat-btn w-full text-xs font-bold uppercase tracking-wide py-2.5 rounded-xl bg-blue-950 text-white hover:bg-blue-900 transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/40" data-group-id="${group.id}">
                        <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Open Group Chat
                    </button>
                ` : ''}
                ${!isMember && !isCreator ? `
                    <p class="text-[10px] text-slate-400 text-center">Request approval from the circle creator to access chat.</p>
                ` : ''}
            </div>
        `;
    }

    function renderGrid() {
        if (!els.grid || activeChatGroupId) return;

        const user = getUser();
        const uid = user ? user.uid : null;
        const noDomain = !institutionDomain;

        if (noDomain) {
            const loggedOut = !uid;
            els.grid.innerHTML = `
                <div class="col-span-full py-20 text-center space-y-3 max-w-md mx-auto">
                    <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <i data-lucide="${loggedOut ? 'lock' : 'mail-question'}" class="w-8 h-8"></i>
                    </div>
                    <p class="text-sm font-bold text-slate-700">${loggedOut ? 'Log in to view campus circles' : 'School email required'}</p>
                    <p class="text-xs text-slate-400 leading-relaxed">${loggedOut
                        ? 'Sign in to request access and chat with approved circle members.'
                        : 'Use a university email (e.g. you@school.edu) so we can match your institution domain.'}</p>
                </div>
            `;
            refreshIcons();
            return;
        }

        if (!groupsCache.length) {
            els.grid.innerHTML = `
                <div class="col-span-full py-20 text-center space-y-2">
                    <p class="text-sm font-bold text-slate-500">No active circles yet.</p>
                    <p class="text-xs text-slate-400">Be the first to create one for ${escapeHtml(formatCampusDisplayName(institutionDomain))}.</p>
                </div>
            `;
            refreshIcons();
            return;
        }

        els.grid.innerHTML = '';

        groupsCache.forEach(group => {
            const isExpanded = expandedGroupId === group.id;
            const actionState = getPrimaryActionState(group, uid);
            const busy = actionPending.has(group.id);
            const label = busy ? 'Updating…' : actionState.label;
            const count = GroupsController.memberCount(group);
            const pendingBadge = group.pendingRequests.length && GroupsController.isCreator(group, uid)
                ? `<span class="shrink-0 text-[9px] font-bold uppercase bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-md">${group.pendingRequests.length} pending</span>`
                : '';

            const card = document.createElement('article');
            card.className = `groups-card bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col gap-3 ${isExpanded ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}`;
            card.dataset.groupId = group.id;

            card.innerHTML = `
                <button type="button" class="groups-expand-trigger text-left w-full focus:outline-none" data-group-id="${group.id}">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h3 class="font-extrabold text-slate-900 text-sm tracking-tight truncate">${escapeHtml(group.name)}</h3>
                            <p class="text-[10px] text-slate-400 mt-1 truncate">Started by <span class="font-semibold text-slate-500">${escapeHtml(group.creatorName)}</span></p>
                        </div>
                        <div class="flex flex-col items-end gap-1 shrink-0">
                            <span class="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">${count} ${count === 1 ? 'member' : 'members'}</span>
                            ${pendingBadge}
                        </div>
                    </div>
                    <p class="text-xs text-slate-500 leading-relaxed mt-3 ${isExpanded ? '' : 'line-clamp-2'}">${escapeHtml(group.description) || 'No description provided.'}</p>
                </button>
                ${buildExpandedPanel(group, uid)}
                <button type="button" class="groups-primary-action w-full text-xs font-bold uppercase tracking-wide py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-50 disabled:cursor-not-allowed ${actionButtonClasses(actionState.variant)}" data-group-id="${group.id}" data-action="${actionState.action}" ${actionState.disabled || busy ? 'disabled' : ''}>${label}</button>
            `;

            card.querySelector('.groups-expand-trigger').addEventListener('click', () => toggleExpandGroup(group.id));
            const primaryBtn = card.querySelector('.groups-primary-action');
            if (primaryBtn && primaryBtn.dataset.action !== 'none') {
                primaryBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    handlePrimaryAction(group.id, primaryBtn.dataset.action);
                });
            }

            const openChatBtn = card.querySelector('.groups-open-chat-btn');
            if (openChatBtn) {
                openChatBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    openChatPanel(group.id);
                });
            }

            els.grid.appendChild(card);
        });

        refreshIcons();

        const expandedGroup = expandedGroupId ? getGroupById(expandedGroupId) : null;
        if (expandedGroup && GroupsController.isCreator(expandedGroup, uid)) {
            hydrateAdminConsole(expandedGroup);
        }
    }

    function renderErrorState(message) {
        if (!els.grid) return;
        closeChatPanel();
        els.grid.innerHTML = `
            <div class="col-span-full py-16 text-center space-y-2">
                <p class="text-sm font-bold text-red-500">${escapeHtml(message || 'Could not load circles.')}</p>
                <p class="text-xs text-slate-400">Check your connection, Firestore rules, or composite index.</p>
            </div>
        `;
        refreshIcons();
    }

    function stopGroupsStream() {
        if (groupsUnsubscribe) {
            groupsUnsubscribe();
            groupsUnsubscribe = null;
        }
    }

    function stopMessagesStream() {
        if (messagesUnsubscribe) {
            messagesUnsubscribe();
            messagesUnsubscribe = null;
        }
    }

    function toggleExpandGroup(groupId) {
        expandedGroupId = expandedGroupId === groupId ? null : groupId;
        if (!activeChatGroupId) renderGrid();
    }

    function openChatPanel(groupId) {
        const user = getUser();
        const group = getGroupById(groupId);
        if (!user || !group) return;
        if (!GroupsController.isMember(group, user.uid)) {
            alert('You must be an approved member to open group chat.');
            return;
        }

        activeChatGroupId = groupId;
        chatMessagesCache = [];
        expandedGroupId = groupId;

        els.grid.classList.add('hidden');
        els.chatPanel.classList.remove('hidden');
        els.chatPanel.classList.add('flex');
        if (els.dashboardChrome) els.dashboardChrome.classList.add('hidden');
        if (els.chatTitle) els.chatTitle.textContent = group.name;
        if (els.chatInput) els.chatInput.value = '';
        if (els.chatMessages) {
            els.chatMessages.innerHTML = '<p class="text-xs text-slate-400 text-center py-8">Loading messages…</p>';
        }

        stopMessagesStream();
        messagesUnsubscribe = GroupsController.subscribeGroupMessages(
            groupId,
            messages => {
                if (!isActive || activeChatGroupId !== groupId) return;
                chatMessagesCache = messages;
                renderChatMessages(groupId);
            },
            err => {
                console.error('[GroupsView] messages stream error:', err);
                if (els.chatMessages) {
                    els.chatMessages.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Could not load messages.</p>';
                }
            }
        );

        refreshIcons();
        if (els.chatInput) els.chatInput.focus();
    }

    function closeChatPanel() {
        stopMessagesStream();
        activeChatGroupId = null;
        chatMessagesCache = [];

        if (els.chatPanel) {
            els.chatPanel.classList.add('hidden');
            els.chatPanel.classList.remove('flex');
        }
        if (els.grid) els.grid.classList.remove('hidden');
        if (els.dashboardChrome) els.dashboardChrome.classList.remove('hidden');
        if (els.chatMessages) els.chatMessages.innerHTML = '';
        if (els.chatInput) els.chatInput.value = '';

        if (isActive) renderGrid();
    }

    function renderChatMessages(groupId) {
        if (!els.chatMessages || activeChatGroupId !== groupId) return;

        const user = getUser();
        const uid = user ? user.uid : null;

        if (!chatMessagesCache.length) {
            els.chatMessages.innerHTML = '<p class="text-xs text-slate-400 text-center py-10 italic">No messages yet — say hello to your circle.</p>';
            return;
        }

        els.chatMessages.innerHTML = chatMessagesCache.map(msg => {
            const isSelf = msg.senderId === uid;
            return `
                <div class="flex ${isSelf ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[85%] rounded-2xl px-3 py-2 ${isSelf ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'}">
                        <p class="text-[9px] font-bold uppercase tracking-wide opacity-80 mb-0.5">${escapeHtml(msg.senderName)}</p>
                        <p class="text-xs leading-relaxed break-words">${escapeHtml(msg.text)}</p>
                    </div>
                </div>
            `;
        }).join('');

        els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const user = getUser();
        if (!user || !activeChatGroupId) return;

        const text = els.chatInput.value;
        if (!text.trim()) return;

        try {
            await GroupsController.sendGroupMessage(activeChatGroupId, user, text);
            els.chatInput.value = '';
        } catch (err) {
            console.error('[GroupsView] send message failed:', err);
            alert('Could not send message. Please try again.');
        }
    }

    async function handlePrimaryAction(groupId, action) {
        const user = getUser();
        if (!user) {
            alert('Log in to interact with circles.');
            return;
        }
        if (actionPending.has(groupId)) return;

        actionPending.add(groupId);
        renderGrid();

        try {
            if (action === 'leave') {
                await GroupsController.leaveGroup(groupId, user.uid);
                if (expandedGroupId === groupId) expandedGroupId = null;
            } else if (action === 'request') {
                await GroupsController.requestJoin(groupId, user.uid);
            }
        } catch (err) {
            console.error('[GroupsView] primary action failed:', err);
            alert('Could not update your circle status. Please try again.');
        } finally {
            actionPending.delete(groupId);
            if (isActive && !activeChatGroupId) renderGrid();
        }
    }

    async function handleAcceptApplicant(groupId, applicantUid) {
        const key = `${groupId}:${applicantUid}`;
        if (adminActionPending.has(key)) return;

        adminActionPending.add(key);
        try {
            await GroupsController.acceptJoinRequest(groupId, applicantUid);
        } catch (err) {
            console.error('[GroupsView] accept failed:', err);
            alert('Could not accept this request.');
        } finally {
            adminActionPending.delete(key);
            const group = getGroupById(groupId);
            if (group && isActive) hydrateAdminConsole(group);
        }
    }

    async function handleDenyApplicant(groupId, applicantUid) {
        const key = `${groupId}:${applicantUid}`;
        if (adminActionPending.has(key)) return;

        adminActionPending.add(key);
        try {
            await GroupsController.denyJoinRequest(groupId, applicantUid);
        } catch (err) {
            console.error('[GroupsView] deny failed:', err);
            alert('Could not deny this request.');
        } finally {
            adminActionPending.delete(key);
            const group = getGroupById(groupId);
            if (group && isActive) hydrateAdminConsole(group);
        }
    }

    function openCreateModal() {
        const user = getUser();
        if (!user) {
            alert('Log in to create a campus circle.');
            return;
        }
        if (!institutionDomain) {
            alert('A school email domain is required to create circles.');
            return;
        }
        els.modal.classList.remove('hidden');
        els.modal.classList.add('flex');
        els.inputName.focus();
    }

    function closeCreateModal() {
        if (!els.modal) return;
        els.modal.classList.add('hidden');
        els.modal.classList.remove('flex');
    }

    async function handleCreateSubmit(e) {
        e.preventDefault();
        const user = getUser();
        if (!user) return alert('Log in to create a campus circle.');

        try {
            if (!institutionDomain && resolveInstitutionDomain) {
                institutionDomain = await resolveInstitutionDomain(user);
                if (typeof onDomainResolved === 'function') onDomainResolved(institutionDomain);
            }
            if (!institutionDomain) return alert('A school email domain is required.');

            await GroupsController.createGroup({
                name: els.inputName.value,
                description: els.inputDescription.value,
                institutionDomain,
                user
            });

            els.createForm.reset();
            closeCreateModal();
        } catch (err) {
            console.error('[GroupsView] create failed:', err);
            alert('Could not create this circle. Please try again.');
        }
    }

    async function startStream() {
        stopGroupsStream();

        const user = getUser();
        if (!user) {
            institutionDomain = null;
            groupsCache = [];
            updateHeaderChrome();
            if (!activeChatGroupId) renderGrid();
            return;
        }

        try {
            if (resolveInstitutionDomain) {
                institutionDomain = await resolveInstitutionDomain(user);
                if (typeof onDomainResolved === 'function') onDomainResolved(institutionDomain);
            }
        } catch (err) {
            console.error('[GroupsView] domain resolve failed:', err);
        }

        updateHeaderChrome();

        if (!institutionDomain) {
            groupsCache = [];
            if (!activeChatGroupId) renderGrid();
            return;
        }

        groupsUnsubscribe = GroupsController.subscribeCampusGroups(
            institutionDomain,
            groups => {
                if (!isActive) return;
                groupsCache = groups;

                if (expandedGroupId && !groups.find(g => g.id === expandedGroupId)) {
                    expandedGroupId = null;
                }
                if (activeChatGroupId) {
                    const chatGroup = groups.find(g => g.id === activeChatGroupId);
                    const uid = getUser()?.uid;
                    if (!chatGroup || !GroupsController.isMember(chatGroup, uid)) {
                        closeChatPanel();
                    } else if (els.chatTitle) {
                        els.chatTitle.textContent = chatGroup.name;
                    }
                }

                if (!activeChatGroupId) {
                    renderGrid();
                    const expanded = expandedGroupId ? getGroupById(expandedGroupId) : null;
                    if (expanded && GroupsController.isCreator(expanded, getUser()?.uid)) {
                        hydrateAdminConsole(expanded);
                    }
                }
            },
            err => {
                console.error('[GroupsView] stream error:', err);
                if (isActive) renderErrorState('Could not load campus circles.');
            }
        );
    }

    function init(config) {
        rootEl = config.rootEl;
        getFirestore = config.getFirestore;
        getCurrentUser = config.getCurrentUser;
        resolveInstitutionDomain = config.resolveInstitutionDomain;
        onDomainResolved = config.onDomainResolved;

        const firestore = getFirestore ? getFirestore() : null;
        GroupsController.init(firestore);
        mountDashboardShell();
    }

    function activate() {
        if (!mounted) return;
        isActive = true;
        startStream();
    }

    function deactivate() {
        isActive = false;
        stopGroupsStream();
        stopMessagesStream();
        closeChatPanel();
        actionPending.clear();
        adminActionPending.clear();
        groupsCache = [];
        expandedGroupId = null;
        institutionDomain = null;
        closeCreateModal();
        if (els.createForm) els.createForm.reset();
        updateHeaderChrome();
        if (els.grid) {
            els.grid.innerHTML = '';
            els.grid.classList.remove('hidden');
        }
        if (els.dashboardChrome) els.dashboardChrome.classList.remove('hidden');
    }

    function onAuthStateChanged() {
        if (!isActive) return;
        startStream();
    }

    function notifyDomainCache(domain) {
        institutionDomain = domain || null;
        if (isActive) {
            updateHeaderChrome();
            startStream();
        }
    }

    return {
        init,
        activate,
        deactivate,
        onAuthStateChanged,
        notifyDomainCache
    };
})();

window.GroupsView = GroupsView;
