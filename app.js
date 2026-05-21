// ============================================================
// HOMIES — FULLY INTEGRATED APP + STAR RATING SYSTEM
// ============================================================

// --- INITIALIZE INSTANCE CORE ---
const firebaseConfig = {
  apiKey: "AIzaSyDfBpznXuifN0FF6i4OPYSPxlgu16ER3gI",
  authDomain: "homies-9d0a5.firebaseapp.com",
  projectId: "homies-9d0a5",
  storageBucket: "homies-9d0a5.firebasestorage.app",
  messagingSenderId: "203127709993",
  appId: "1:203127709993:web:c29a1b36aba3e01dd6d738"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// --- DOM NAVIGATION & MODAL PLUGINS ---
const logInBtn = document.getElementById('logInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const signOutBtn = document.getElementById('signOutBtn');
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const globalUnreadBadge = document.getElementById('globalUnreadBadge');

// Split Authentication Components
const emailAuthForm = document.getElementById('emailAuthForm');
const authNameFieldContainer = document.getElementById('authNameFieldContainer');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmitFormBtn = document.getElementById('authSubmitFormBtn');
const modalAuthTitle = document.getElementById('modalAuthTitle');
const modalAuthSubtitle = document.getElementById('modalAuthSubtitle');

// Onboarding Struct Holders
const onboardingModal = document.getElementById('onboardingModal');
const onboardingForm = document.getElementById('onboardingForm');

// Core Application Views Map Nodes
const viewHome = document.getElementById('viewHome');
const viewNetwork = document.getElementById('viewNetwork');
const viewCommunity = document.getElementById('viewCommunity');
const viewMarketplace = document.getElementById('viewMarketplace');
const viewMyProfile = document.getElementById('viewMyProfile');
const viewMessages = document.getElementById('viewMessages');

// Global Navigation Actions
const navHome = document.getElementById('navHome');
const navNetwork = document.getElementById('navNetwork');
const navCommunity = document.getElementById('navCommunity');
const navMarketplace = document.getElementById('navMarketplace');
const navMyProfile = document.getElementById('navMyProfile');
const navMessages = document.getElementById('navMessages');
const navLogo = document.getElementById('navLogo');
const homeExploreBtn = document.getElementById('homeExploreBtn');

// Message Panel Features
const emojiToggleBtn = document.getElementById('emojiToggleBtn');
const emojiPickerPanel = document.getElementById('emojiPickerPanel');

// Profile Customizer Configs
const toggleEditHubBtn = document.getElementById('toggleEditHubBtn');
const profileHubStaticView = document.getElementById('profileHubStaticView');
const profileHubForm = document.getElementById('profileHubForm');
const cancelHubEditBtn = document.getElementById('cancelHubEditBtn');
const hubPhotoUrl = document.getElementById('hubPhotoUrl');
const hubCollege = document.getElementById('hubCollege');
const hubMajor = document.getElementById('hubMajor');
const hubBio = document.getElementById('hubBio');
const hubSkills = document.getElementById('hubSkills');

// Dynamic Marketplace / Feed Elements
const networkGrid = document.getElementById('networkGrid');
const studentCounter = document.getElementById('studentCounter');
const communityPostBox = document.getElementById('communityPostBox');
const communityForm = document.getElementById('communityForm');
const communityGrid = document.getElementById('communityGrid');
const openMarketModalBtn = document.getElementById('openMarketModalBtn');
const marketModal = document.getElementById('marketModal');
const closeMarketModalBtn = document.getElementById('closeMarketModalBtn');
const marketForm = document.getElementById('marketForm');
const marketplaceGrid = document.getElementById('marketplaceGrid');

// Live Messaging View Setup
const chatSidebarList = document.getElementById('chatSidebarList');
const chatWindowHeader = document.getElementById('chatWindowHeader');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderItem = document.getElementById('chatHeaderItem');
const chatHeaderPresenceIndicator = document.getElementById('chatHeaderPresenceIndicator');
const chatMessageStream = document.getElementById('chatMessageStream');
const chatFormInputBar = document.getElementById('chatFormInputBar');
const chatInputField = document.getElementById('chatInputField');
const chatFallbackPlaceholder = document.getElementById('chatFallbackPlaceholder');
const onlineOverviewRow = document.getElementById('onlineOverviewRow');

// Global Tracking Frameworks
let activeChatId = null;
let currentPeerUidTracker = null;
let chatMessagesUnsubscribe = null;
let globalUnreadUnsubscribe = null;
let presenceUnsubscribe = null;
let allStudentsCache = [];
let userOnlineStatuses = {};
let isSigningUp = false;

// ============================================================
// ⭐ RATING SYSTEM ENGINE
// ============================================================

// Submit or overwrite a rating (1 rating per user pair)
async function submitRating(targetUid, score) {
    const user = auth.currentUser;
    if (!user) return alert("Sign in to rate!");
    if (user.uid === targetUid) return alert("You cannot rate yourself.");
    const ratingId = `${user.uid}_${targetUid}`;
    await db.collection('ratings').doc(ratingId).set({
        from: user.uid,
        to: targetUid,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Refresh the card's star display after submission
    renderFilteredNetwork(allStudentsCache);
    showRatingToast(`${score} ★ submitted!`);
}

// Fetch average rating for a given user (returns "0" if none)
async function getAverageRating(uid) {
    const snapshot = await db.collection('ratings').where('to', '==', uid).get();
    if (snapshot.empty) return null;
    let total = 0;
    snapshot.forEach(doc => total += doc.data().score);
    return (total / snapshot.size).toFixed(1);
}

// Fetch the current user's existing rating for a target (returns null if none)
async function getMyRatingFor(targetUid) {
    const user = auth.currentUser;
    if (!user) return null;
    const ratingId = `${user.uid}_${targetUid}`;
    const doc = await db.collection('ratings').doc(ratingId).get();
    return doc.exists ? doc.data().score : null;
}

// Animated toast notification
function showRatingToast(message) {
    let toast = document.getElementById('homies-rating-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'homies-rating-toast';
        toast.style.cssText = `
            position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(60px);
            background:#0f172a; color:#f8fafc; padding:10px 20px; border-radius:100px;
            font-size:13px; font-weight:700; z-index:9999; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
            opacity:0; pointer-events:none; white-space:nowrap;
        `;
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(60px)';
    }, 2400);
}

// Inject rating CSS once into the page head
function injectRatingStyles() {
    if (document.getElementById('homies-star-styles')) return;
    const style = document.createElement('style');
    style.id = 'homies-star-styles';
    style.textContent = `
        .star-rating-row { display:flex; gap:3px; align-items:center; }
        .star-btn {
            background:none; border:none; cursor:pointer; font-size:18px;
            color:#cbd5e1; transition:color 0.1s, transform 0.1s; padding:0 1px; line-height:1;
        }
        .star-btn.active { color:#f59e0b; }
        .star-btn.preview { color:#f59e0b; opacity:0.65; }
        .star-btn:active { transform:scale(1.3); }
        .rating-avg-row { display:flex; align-items:center; gap:5px; }
        .rating-avg-stars { font-size:12px; letter-spacing:1px; }
        .rating-avg-num { font-size:11px; font-weight:800; color:#1e293b; }
        .rating-avg-count { font-size:10px; color:#94a3b8; font-weight:600; }
        .rating-my-label { font-size:10px; color:#94a3b8; font-weight:600; min-height:13px; }
        .rating-my-label.done { color:#059669; }
    `;
    document.head.appendChild(style);
}

// Build the interactive star widget into a container element
async function renderStarWidget(containerEl, student) {
    if (!containerEl) return;
    injectRatingStyles();

    const currentUser = auth.currentUser;
    const isMe = currentUser && currentUser.uid === student.uid;
    const avg = await getAverageRating(student.uid);
    const myRating = await getMyRatingFor(student.uid);

    // Static stars for average display
    const avgStarsHtml = [1,2,3,4,5].map(i => {
        if (avg && i <= Math.round(avg)) return `<span style="color:#f59e0b;">★</span>`;
        return `<span style="color:#cbd5e1;">★</span>`;
    }).join('');

    containerEl.innerHTML = `
        ${!isMe ? `
        <div class="star-rating-row" id="starRow_${student.uid}">
            ${[1,2,3,4,5].map(n => `
                <button
                    class="star-btn ${myRating && n <= myRating ? 'active' : ''}"
                    data-val="${n}"
                    onmouseenter="previewStarRow('${student.uid}', ${n})"
                    onmouseleave="resetStarRow('${student.uid}', ${myRating || 0})"
                    onclick="event.stopPropagation(); handleStarClick('${student.uid}', ${n})"
                    aria-label="Rate ${n} star"
                >★</button>
            `).join('')}
        </div>
        <div class="rating-my-label ${myRating ? 'done' : ''}" id="starLabel_${student.uid}">
            ${myRating ? `Your rating: ${myRating} ★` : 'Tap to rate'}
        </div>
        ` : `<div class="rating-my-label">Your own profile</div>`}
        <div class="rating-avg-row" style="margin-top:3px;">
            <span class="rating-avg-stars">${avgStarsHtml}</span>
            <span class="rating-avg-num">${avg ? avg : '—'}</span>
            <span class="rating-avg-count">(${avg ? 'rated' : 'no ratings yet'})</span>
        </div>
    `;
}

// Hover: preview stars up to hoverVal
window.previewStarRow = function(uid, hoverVal) {
    document.querySelectorAll(`#starRow_${uid} .star-btn`).forEach(btn => {
        btn.classList.remove('active', 'preview');
        if (parseInt(btn.dataset.val) <= hoverVal) btn.classList.add('preview');
    });
};

// Mouse leave: restore to the user's actual saved rating
window.resetStarRow = function(uid, myRating) {
    document.querySelectorAll(`#starRow_${uid} .star-btn`).forEach(btn => {
        btn.classList.remove('preview', 'active');
        if (myRating && parseInt(btn.dataset.val) <= myRating) btn.classList.add('active');
    });
};

// Click: optimistic UI then Firestore write
window.handleStarClick = async function(uid, val) {
    // Optimistic update
    document.querySelectorAll(`#starRow_${uid} .star-btn`).forEach(btn => {
        btn.classList.remove('preview');
        btn.classList.toggle('active', parseInt(btn.dataset.val) <= val);
    });
    const label = document.getElementById(`starLabel_${uid}`);
    if (label) { label.innerText = `Your rating: ${val} ★`; label.classList.add('done'); }

    await submitRating(uid, val);
};

// ============================================================
// --- ROUTER VIEW CHANGER ENGINE ---
// ============================================================

function switchView(activeViewName) {
    viewHome.classList.add('hidden');
    viewNetwork.classList.add('hidden');
    viewCommunity.classList.add('hidden');
    viewMarketplace.classList.add('hidden');
    viewMyProfile.classList.add('hidden');
    viewMessages.classList.add('hidden');

    const buttons = [navHome, navNetwork, navCommunity, navMarketplace, navMyProfile, navMessages];
    buttons.forEach(btn => {
        btn.className = "text-slate-300 hover:text-white transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
    });

    if (activeViewName === 'home') {
        viewHome.classList.remove('hidden');
        navHome.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none relative";
    } else if (activeViewName === 'network') {
        viewNetwork.classList.remove('hidden');
        navNetwork.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none relative";
    } else if (activeViewName === 'community') {
        viewCommunity.classList.remove('hidden');
        navCommunity.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none relative";
    } else if (activeViewName === 'marketplace') {
        viewMarketplace.classList.remove('hidden');
        navMarketplace.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none relative";
    } else if (activeViewName === 'myprofile') {
        viewMyProfile.classList.remove('hidden');
        navMyProfile.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none relative";
        closeHubEditingState();
    } else if (activeViewName === 'messages') {
        viewMessages.classList.remove('hidden');
        navMessages.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none relative";
        if (activeChatId) { clearUnreadBadgeStateMarker(activeChatId); }
    }
    lucide.createIcons();
}

navHome.addEventListener('click', () => switchView('home'));
navNetwork.addEventListener('click', () => switchView('network'));
navCommunity.addEventListener('click', () => switchView('community'));
navMarketplace.addEventListener('click', () => switchView('marketplace'));
navMyProfile.addEventListener('click', () => switchView('myprofile'));
navMessages.addEventListener('click', () => switchView('messages'));
navLogo.addEventListener('click', () => switchView('home'));
homeExploreBtn.addEventListener('click', () => switchView('network'));

// ============================================================
// --- REALTIME USER PRESENCE ENGINE ---
// ============================================================

function updateUserOnlineStatus(statusValue) {
    const user = auth.currentUser;
    if (!user) return;
    db.collection('users').doc(user.uid).update({
        presence: statusValue,
        lastActive: Date.now()
    }).catch(err => console.log("Presence tracking offline initialized safely."));
}

window.addEventListener('beforeunload', () => updateUserOnlineStatus('offline'));
document.addEventListener('visibilitychange', () => {
    updateUserOnlineStatus(document.visibilityState === 'visible' ? 'online' : 'offline');
});

function initializeGlobalPresenceListener() {
    if (presenceUnsubscribe) presenceUnsubscribe();
    presenceUnsubscribe = db.collection('users').onSnapshot(snapshot => {
        userOnlineStatuses = {};
        let onlineUsersArray = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            userOnlineStatuses[data.uid] = data.presence || 'offline';
            if (data.presence === 'online' && (!auth.currentUser || data.uid !== auth.currentUser.uid)) {
                onlineUsersArray.push(data);
            }
        });
        renderFilteredNetwork(allStudentsCache);
        listenToMarketplace();
        renderOnlineBubbleRoster(onlineUsersArray);
        if (activeChatId && currentPeerUidTracker) updateChatHeaderPresenceRing(currentPeerUidTracker);
    });
}

function renderOnlineBubbleRoster(onlineUsers) {
    onlineOverviewRow.innerHTML = "";
    if (onlineUsers.length === 0) {
        onlineOverviewRow.innerHTML = `<span class="text-[10px] text-slate-400 italic font-medium py-1">Class is quiet right now...</span>`;
        return;
    }
    onlineUsers.forEach(u => {
        const wrap = document.createElement('div');
        wrap.className = "flex flex-col items-center flex-shrink-0 text-center space-y-0.5 cursor-pointer max-w-[50px]";
        wrap.setAttribute('onclick', `switchView('network'); document.getElementById('networkSearchInput').value = '${u.fullName}'; renderFilteredNetwork(allStudentsCache);`);
        const avatarStr = u.photoUrl
            ? `<img src="${u.photoUrl}" class="w-8 h-8 rounded-full object-cover">`
            : `<div class="w-8 h-8 rounded-full ${getAvatarColorClass(u.fullName)} text-white font-bold flex items-center justify-center text-xs uppercase">${u.fullName.charAt(0)}</div>`;
        wrap.innerHTML = `
            <div class="relative">
                ${avatarStr}
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            </div>
            <span class="text-[9px] font-bold text-slate-700 truncate w-full block">${u.fullName.split(' ')[0]}</span>
        `;
        onlineOverviewRow.appendChild(wrap);
    });
}

function updateChatHeaderPresenceRing(peerUid) {
    const state = userOnlineStatuses[peerUid] || 'offline';
    chatHeaderPresenceIndicator.classList.remove('hidden', 'bg-green-500', 'bg-slate-400');
    chatHeaderPresenceIndicator.classList.add('block');
    chatHeaderPresenceIndicator.classList.add(state === 'online' ? 'bg-green-500' : 'bg-slate-400');
}

// ============================================================
// --- AUTH MODALS ---
// ============================================================

logInBtn.addEventListener('click', () => {
    isSigningUp = false;
    modalAuthTitle.innerText = "Log In to Homies";
    modalAuthSubtitle.innerText = "Welcome back! Connect to your campus account.";
    authNameFieldContainer.classList.add('hidden');
    authName.removeAttribute('required');
    authSubmitFormBtn.innerText = "Log In";
    loginModal.classList.remove('hidden');
});

signUpBtn.addEventListener('click', () => {
    isSigningUp = true;
    modalAuthTitle.innerText = "Create Your Account";
    modalAuthSubtitle.innerText = "Join your exclusive student framework node today.";
    authNameFieldContainer.classList.remove('hidden');
    authName.setAttribute('required', 'true');
    authSubmitFormBtn.innerText = "Sign Up";
    loginModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    emailAuthForm.reset();
});

openMarketModalBtn.addEventListener('click', () => marketModal.classList.remove('hidden'));
closeMarketModalBtn.addEventListener('click', () => marketModal.classList.add('hidden'));

emailAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = authEmail.value.trim();
    const passwordVal = authPassword.value;
    const nameVal = authName.value.trim();

    if (isSigningUp) {
        auth.createUserWithEmailAndPassword(emailVal, passwordVal)
            .then(cred => cred.user.updateProfile({ displayName: nameVal }).then(() => cred.user))
            .then(user => { loginModal.classList.add('hidden'); emailAuthForm.reset(); evaluateAuthUserRoute(user); })
            .catch(err => alert("Registration Error: " + err.message));
    } else {
        auth.signInWithEmailAndPassword(emailVal, passwordVal)
            .then(cred => { loginModal.classList.add('hidden'); emailAuthForm.reset(); evaluateAuthUserRoute(cred.user); })
            .catch(err => alert("Log In Error: " + err.message));
    }
});

googleLoginBtn.addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(result => { loginModal.classList.add('hidden'); evaluateAuthUserRoute(result.user); })
        .catch(err => console.error("Auth failure:", err));
});

function evaluateAuthUserRoute(user) {
    db.collection('users').doc(user.uid).get().then(doc => {
        if (!doc.exists) { onboardingModal.classList.remove('hidden'); }
        else { updateUserOnlineStatus('online'); }
    });
}

// Word utility calculator helper
function getWordCount(str) {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const bioText = document.getElementById('obBio').value;
    // Word validation rule limit logic configuration
    if (getWordCount(bioText) > 30) {
        return alert("Validation Alert: To avoid profile layout cutting, your bio must be 30 words or fewer!");
    }

    db.collection('users').doc(currentUser.uid).set({
        uid: currentUser.uid,
        fullName: currentUser.displayName || "Student Homie",
        email: currentUser.email,
        photoUrl: currentUser.photoURL || "",
        collegeName: document.getElementById('obCollege').value.trim(),
        major: document.getElementById('obMajor').value.trim(),
        bio: bioText.trim(),
        skills: document.getElementById('obSkills').value.trim(),
        presence: 'online',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => {
        onboardingModal.classList.add('hidden');
        onboardingForm.reset();
        updateUserOnlineStatus('online');
    });
});

signOutBtn.addEventListener('click', () => {
    updateUserOnlineStatus('offline');
    auth.signOut().then(() => switchView('home'));
});

// ============================================================
// --- UNREAD BADGE SYSTEM ---
// ============================================================

function initializeGlobalUnreadBadgeListener(currentUid) {
    if (globalUnreadUnsubscribe) globalUnreadUnsubscribe();
    globalUnreadUnsubscribe = db.collection('chats')
        .where('participants', 'array-contains', currentUid)
        .onSnapshot(snapshot => {
            let totalUnread = 0;
            snapshot.forEach(doc => {
                const chatData = doc.data();
                if (chatData.lastSenderUid && chatData.lastSenderUid !== currentUid && activeChatId !== chatData.chatId) {
                    totalUnread++;
                }
            });
            if (totalUnread > 0) {
                globalUnreadBadge.innerText = totalUnread;
                globalUnreadBadge.classList.remove('hidden');
            } else {
                globalUnreadBadge.classList.add('hidden');
            }
        });
}

function clearUnreadBadgeStateMarker(chatId) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    db.collection('chats').doc(chatId).get().then(doc => {
        if (doc.exists && doc.data().lastSenderUid !== currentUser.uid) {
            db.collection('chats').doc(chatId).update({ lastSenderUid: currentUser.uid });
        }
    });
}

// ============================================================
// --- GLOBAL AUTH STATE WATCHER ---
// ============================================================

auth.onAuthStateChanged(user => {
    if (user) {
        logInBtn.classList.add('hidden');
        signUpBtn.classList.add('hidden');
        signOutBtn.classList.remove('hidden');
        openMarketModalBtn.classList.remove('hidden');
        communityPostBox.classList.remove('hidden');
        navMyProfile.classList.remove('hidden');
        navMessages.classList.remove('hidden');
        updateUserOnlineStatus('online');
        renderMyShowcaseDashboard(user.uid);
        listenToUserInboxChats();
        initializeGlobalUnreadBadgeListener(user.uid);
        initializeGlobalPresenceListener();
    } else {
        logInBtn.classList.remove('hidden');
        signUpBtn.classList.remove('hidden');
        signOutBtn.classList.add('hidden');
        openMarketModalBtn.classList.add('hidden');
        communityPostBox.classList.add('hidden');
        navMyProfile.classList.add('hidden');
        navMessages.classList.add('hidden');
        marketModal.classList.add('hidden');
        onboardingModal.classList.add('hidden');
        if (chatMessagesUnsubscribe) chatMessagesUnsubscribe();
        if (globalUnreadUnsubscribe) globalUnreadUnsubscribe();
        if (presenceUnsubscribe) presenceUnsubscribe();
        chatSidebarList.innerHTML = "";
        onlineOverviewRow.innerHTML = "";
        globalUnreadBadge.classList.add('hidden');
    }
    listenToMarketplace();
    listenToCommunityHub();
});

// ============================================================
// --- EMOJI PICKER ---
// ============================================================

emojiToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPickerPanel.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!emojiPickerPanel.contains(e.target) && e.target !== emojiToggleBtn) {
        emojiPickerPanel.classList.add('hidden');
    }
});

document.querySelectorAll('.emoji-opt').forEach(elm => {
    elm.addEventListener('click', () => {
        chatInputField.value += elm.innerText;
        emojiPickerPanel.classList.add('hidden');
        chatInputField.focus();
    });
});

// ============================================================
// --- DESIGN HELPER UTILITIES ---
// ============================================================

function getAvatarColorClass(name) {
    if (!name) return "bg-slate-800";
    const colors = ["bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-purple-600", "bg-pink-600", "bg-teal-600", "bg-orange-600"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getCategoryBadgeStyle(category) {
    switch (category) {
        case 'Skill Trade': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'Books & Notes': return 'bg-purple-50 text-purple-700 border border-purple-200';
        case 'Electronics': return 'bg-amber-50 text-amber-700 border border-amber-200';
        default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
}

// ============================================================
// --- PROFILE SETTINGS MANAGER ---
// ============================================================

function renderMyShowcaseDashboard(uid) {
    db.collection('users').doc(uid).onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();

        document.getElementById('myProfileName').innerText = data.fullName || "Student Homie";
        document.getElementById('myProfileHeadline').innerText = `${data.major || 'Undecided'} at ${data.collegeName || 'Campus'}`;
        document.getElementById('myProfileBio').innerText = data.bio ? `"${data.bio}"` : '"No bio set yet."';

        const avatarBox = document.getElementById('myProfileAvatarBox');
        if (data.photoUrl) {
            avatarBox.innerHTML = `
                <img src="${data.photoUrl}" class="w-full h-full object-cover rounded-full">
                <span class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            `;
        } else {
            avatarBox.className = `w-24 h-24 rounded-full border-4 border-white ${getAvatarColorClass(data.fullName)} shadow-md flex items-center justify-center text-3xl font-bold text-white uppercase relative`;
            avatarBox.innerHTML = `
                ${data.fullName ? data.fullName.charAt(0) : "H"}
                <span class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            `;
        }

        const tagsContainer = document.getElementById('myProfileSkillsTags');
        tagsContainer.innerHTML = "";
        if (data.skills) {
            data.skills.split(',').forEach(skill => {
                if (!skill.trim()) return;
                const span = document.createElement('span');
                span.className = "bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100";
                span.innerText = skill.trim();
                tagsContainer.appendChild(span);
            });
        }

        hubPhotoUrl.value = data.photoUrl || "";
        hubCollege.value = data.collegeName || "";
        hubMajor.value = data.major || "";
        hubBio.value = data.bio || "";
        hubSkills.value = data.skills || "";
        lucide.createIcons();
    });
}

function openHubEditingState() {
    profileHubStaticView.classList.add('hidden');
    profileHubForm.classList.remove('hidden');
    toggleEditHubBtn.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5"></i> <span>Viewing</span>`;
    lucide.createIcons();
}

function closeHubEditingState() {
    profileHubForm.classList.add('hidden');
    profileHubStaticView.classList.remove('hidden');
    toggleEditHubBtn.innerHTML = `<i data-lucide="settings" class="w-3.5 h-3.5"></i> <span>Edit Details</span>`;
    lucide.createIcons();
}

toggleEditHubBtn.addEventListener('click', () => {
    if (profileHubForm.classList.contains('hidden')) { openHubEditingState(); } else { closeHubEditingState(); }
});

cancelHubEditBtn.addEventListener('click', closeHubEditingState);

profileHubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const editBioText = hubBio.value;
    if (getWordCount(editBioText) > 30) {
        return alert("Validation Alert: Your bio must be 30 words or fewer!");
    }

    db.collection('users').doc(currentUser.uid).set({
        photoUrl: hubPhotoUrl.value.trim(),
        collegeName: hubCollege.value.trim(),
        major: hubMajor.value.trim(),
        bio: editBioText.trim(),
        skills: hubSkills.value.trim()
    }, { merge: true }).then(() => closeHubEditingState());
});

// ============================================================
// --- LINKEDIN-STYLE INSPECTION HUB (INSPIRATION MODAL) ---
// ============================================================

window.inspectStudentProfile = function(uid) {
    const targetStudent = allStudentsCache.find(s => s.uid === uid);
    if (!targetStudent) return;

    // Check if an inspection modal template element structure is injected already
    let inspectionModal = document.getElementById('homies-inspection-modal');
    if (!inspectionModal) {
        inspectionModal = document.createElement('div');
        inspectionModal.id = 'homies-inspection-modal';
        inspectionModal.className = "fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[9999] hidden animate-fade-in";
        document.body.appendChild(inspectionModal);
    }

    const presenceStatus = userOnlineStatuses[targetStudent.uid] || 'offline';
    const statusColor = presenceStatus === 'online' ? 'bg-green-500' : 'bg-slate-300';

    let inspectorAvatar = targetStudent.photoUrl 
        ? `<div class="relative w-20 h-20 mx-auto"><img src="${targetStudent.photoUrl}" class="w-full h-full rounded-full object-cover shadow-md"><span class="absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white ${statusColor}"></span></div>`
        : `<div class="relative w-20 h-20 mx-auto rounded-full ${getAvatarColorClass(targetStudent.fullName)} text-white font-bold flex items-center justify-center text-2xl uppercase shadow-md">${targetStudent.fullName ? targetStudent.fullName.charAt(0) : 'H'}<span class="absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white ${statusColor}"></span></div>`;

    let skillsMarkup = "";
    if (targetStudent.skills) {
        targetStudent.skills.split(',').forEach(s => {
            if (!s.trim()) return;
            skillsMarkup += `<span class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg border border-blue-100">${s.trim()}</span>`;
        });
    } else {
        skillsMarkup = `<p class="text-xs text-slate-400 italic">No skills listed yet.</p>`;
    }

    inspectionModal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-slate-100 relative animate-scale-up">
            <button onclick="document.getElementById('homies-inspection-modal').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="text-center space-y-3">
                ${inspectorAvatar}
                <div>
                    <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">${targetStudent.fullName || 'Anonymous Homie'}</h3>
                    <p class="text-sm text-blue-600 font-semibold">${targetStudent.major || 'Undecided'}</p>
                    <p class="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${targetStudent.collegeName || 'Global Campus'}
                    </p>
                </div>
                
                <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left my-4">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Bio / Inspiration Statement</h4>
                    <p class="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">"${targetStudent.bio || 'Hello, let\'s connect!'}"</p>
                </div>

                <div class="text-left">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Framework Skills</h4>
                    <div class="flex flex-wrap gap-1.5">${skillsMarkup}</div>
                </div>

                <div class="pt-4 border-t border-slate-100 flex gap-2">
                    <a href="mailto:${targetStudent.email}" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-sm">
                        <i data-lucide="mail" class="w-4 h-4"></i> Email Connect
                    </a>
                </div>
            </div>
        </div>
    `;

    inspectionModal.classList.remove('hidden');
    lucide.createIcons();
};

// ============================================================
// --- CAMPUS ROSTER + ⭐ RATING INTEGRATION ---
// ============================================================

function listenToStudentNetwork() {
    db.collection('users').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        allStudentsCache = [];
        studentCounter.innerText = `${snapshot.size} Homies Active`;
        if (snapshot.empty) return;
        snapshot.forEach(doc => allStudentsCache.push(doc.data()));
        renderFilteredNetwork(allStudentsCache);
    });
}

// Now async — fetches ratings per card before rendering
async function renderFilteredNetwork(studentsArray) {
    networkGrid.innerHTML = "";
    if (studentsArray.length === 0) {
        networkGrid.innerHTML = `<div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 p-6"><p class="text-slate-400 text-xs font-semibold">No students found.</p></div>`;
        return;
    }

    for (const student of studentsArray) {
        const studentCard = document.createElement('div');
        // Added cursor-pointer & click listener for LinkedIn-style full inspector mode discovery
        studentCard.className = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-full relative overflow-hidden cursor-pointer hover:border-slate-300 transition duration-200";
        studentCard.setAttribute('onclick', `inspectStudentProfile('${student.uid}')`);

        const currentPresence = userOnlineStatuses[student.uid] || 'offline';
        const statusDotColor = currentPresence === 'online' ? 'bg-green-500' : 'bg-slate-300';
        const presenceLabelText = currentPresence === 'online' ? 'Online' : 'Offline';

        let avatarLayout = student.photoUrl
            ? `<div class="relative"><img src="${student.photoUrl}" class="w-10 h-10 rounded-full object-cover shadow-sm"><span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusDotColor}"></span></div>`
            : `<div class="relative"><div class="w-10 h-10 rounded-full ${getAvatarColorClass(student.fullName)} text-white font-bold flex items-center justify-center text-sm uppercase shadow-sm">${student.fullName ? student.fullName.charAt(0) : 'H'}</div><span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusDotColor}"></span></div>`;

        let skillsChips = "";
        if (student.skills) {
            student.skills.split(',').forEach(sk => {
                if (!sk.trim()) return;
                skillsChips += `<span class="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md">${sk.trim()}</span>`;
            });
        }

        studentCard.innerHTML = `
            <div class="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full ${statusDotColor} ${currentPresence === 'online' ? 'animate-pulse' : ''}"></span>
                ${presenceLabelText}
            </div>
            <div>
                <div class="flex items-center gap-3 mb-3">
                    ${avatarLayout}
                    <div>
                        <h4 class="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">${student.fullName || 'Anonymous Homie'}</h4>
                        <p class="text-[11px] text-blue-600 font-semibold">${student.major || 'Undecided'}</p>
                    </div>
                </div>
                <p class="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${student.collegeName || 'Global Campus'}
                </p>
                <p class="text-xs text-slate-600 line-clamp-2 italic mb-3 bg-slate-50 p-2 rounded-xl">"${student.bio || 'Hello, lets connect!'}"</p>
                <div class="flex flex-wrap gap-1 mb-3">${skillsChips}</div>
            </div>

            <div id="ratingWidget_${student.uid}" class="mb-3 pt-2 border-t border-slate-100"></div>

            <div class="mt-auto pt-3 border-t border-slate-100">
                <a href="mailto:${student.email}" onclick="event.stopPropagation();" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-xl transition text-center flex items-center justify-center gap-1.5">
                    <i data-lucide="mail" class="w-3.5 h-3.5"></i> Email Connection
                </a>
            </div>
        `;

        networkGrid.appendChild(studentCard);

        // Inject star widget into the placeholder div
        const widgetEl = studentCard.querySelector(`#ratingWidget_${student.uid}`);
        renderStarWidget(widgetEl, student);
    }

    lucide.createIcons();
}

document.getElementById('networkSearchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { renderFilteredNetwork(allStudentsCache); return; }
    const filtered = allStudentsCache.filter(student =>
        (student.fullName || "").toLowerCase().includes(query) ||
        (student.major || "").toLowerCase().includes(query) ||
        (student.collegeName || "").toLowerCase().includes(query) ||
        (student.skills || "").toLowerCase().includes(query)
    );
    renderFilteredNetwork(filtered);
});

// ============================================================
// --- MESSAGING SYSTEM ---
// ============================================================

window.openMarketplaceChat = function(sellerUid, sellerName, listingTitle) {
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("Sign in to contact sellers!");
    if (currentUser.uid === sellerUid) return alert("Your own listing!");
    const combinedChatId = `${currentUser.uid}_${sellerUid}_${listingTitle.replace(/\s+/g, '')}`;
    db.collection('chats').doc(combinedChatId).set({
        chatId: combinedChatId,
        participants: [currentUser.uid, sellerUid],
        buyerName: currentUser.displayName || "Buyer",
        sellerName: sellerName,
        listingTitle: listingTitle,
        lastMessage: "Conversation opened...",
        lastSenderUid: currentUser.uid,
        lastUpdated: Date.now()
    }, { merge: true }).then(() => {
        switchView('messages');
        loadActiveChatMessageStream(combinedChatId, sellerName, listingTitle, sellerUid);
    });
};

function listenToUserInboxChats() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    db.collection('chats').where('participants', 'array-contains', currentUser.uid).onSnapshot(snapshot => {
        chatSidebarList.innerHTML = "";
        if (snapshot.empty) {
            chatSidebarList.innerHTML = `<p class="text-center text-xs text-slate-400 py-12 italic">No conversations yet.</p>`;
            return;
        }
        snapshot.forEach(doc => {
            const chat = doc.data();
            const isBuyer = currentUser.uid === chat.participants[0];
            const displayPeerName = isBuyer ? chat.sellerName : chat.buyerName;
            const peerUid = isBuyer ? chat.participants[1] : chat.participants[0];
            const presenceState = userOnlineStatuses[peerUid] || 'offline';
            const presenceDotColor = presenceState === 'online' ? 'bg-green-500' : 'bg-slate-300';
            const unreadPingDot = (chat.lastSenderUid && chat.lastSenderUid !== currentUser.uid && activeChatId !== chat.chatId)
                ? `<span class="w-2.5 h-2.5 bg-green-500 rounded-full block animate-pulse"></span>` : '';
            const activeBarIndicator = activeChatId === chat.chatId ? 'bg-blue-50/70 border-r-4 border-blue-600' : '';
            const sidebarItemRow = document.createElement('button');
            sidebarItemRow.className = `w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 outline-none border-b border-slate-100 ${activeBarIndicator}`;
            sidebarItemRow.innerHTML = `
                <div class="relative flex-shrink-0">
                    <div class="w-10 h-10 rounded-full ${getAvatarColorClass(displayPeerName)} text-white font-extrabold text-xs flex items-center justify-center uppercase">${displayPeerName.charAt(0)}</div>
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${presenceDotColor}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-900 text-xs font-bold truncate block">${displayPeerName}</span>
                        ${unreadPingDot}
                    </div>
                    <p class="text-[11px] text-slate-500 truncate mt-0.5">${chat.lastMessage || ''}</p>
                    <span class="text-[9px] text-blue-600 bg-blue-50 font-semibold px-1.5 py-0.5 rounded mt-1 inline-block">🛒 ${chat.listingTitle}</span>
                </div>
            `;
            sidebarItemRow.addEventListener('click', () => loadActiveChatMessageStream(chat.chatId, displayPeerName, chat.listingTitle, peerUid));
            chatSidebarList.appendChild(sidebarItemRow);
        });
    });
}

function loadActiveChatMessageStream(chatId, peerName, listingTitle, peerUid) {
    activeChatId = chatId;
    currentPeerUidTracker = peerUid;
    chatFallbackPlaceholder.classList.add('hidden');
    chatWindowHeader.classList.remove('hidden');
    chatFormInputBar.classList.remove('hidden');
    chatHeaderName.innerText = peerName;
    chatHeaderItem.innerText = `Listing Interest: ${listingTitle}`;
    chatHeaderAvatar.className = `w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase ${getAvatarColorClass(peerName)}`;
    chatHeaderAvatar.innerText = peerName.charAt(0);
    updateChatHeaderPresenceRing(peerUid);
    clearUnreadBadgeStateMarker(chatId);
    if (chatMessagesUnsubscribe) chatMessagesUnsubscribe();
    chatMessagesUnsubscribe = db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc').onSnapshot(snapshot => {
            chatMessageStream.innerHTML = "";
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMe = msg.senderUid === currentUid;
                const messageRowWrapper = document.createElement('div');
                messageRowWrapper.className = `flex w-full ${isMe ? 'justify-end' : 'justify-start'}`;
                const bubbleStyle = isMe
                    ? 'bg-[#d9fdd3] text-slate-900 rounded-l-xl rounded-tr-xl border border-[#c1e8bb]'
                    : 'bg-white text-slate-900 rounded-r-xl rounded-tl-xl border border-slate-200';
                const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                messageRowWrapper.innerHTML = `
                    <div class="max-w-[75%] px-3 py-1.5 text-xs shadow-sm ${bubbleStyle} relative">
                        <p class="whitespace-pre-wrap pb-1 leading-snug">${msg.text}</p>
                        <span class="block text-[9px] text-slate-400 text-right select-none mt-0.5">${timeString}</span>
                    </div>
                `;
                chatMessageStream.appendChild(messageRowWrapper);
            });
            chatMessageStream.scrollTop = chatMessageStream.scrollHeight;
        });
}

chatFormInputBar.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    const messageText = chatInputField.value.trim();
    if (!currentUser || !messageText || !activeChatId) return;
    const messagesRef = db.collection('chats').doc(activeChatId).collection('messages');
    const globalChatRef = db.collection('chats').doc(activeChatId);
    messagesRef.add({
        senderUid: currentUser.uid,
        senderName: (currentUser.displayName || "Homie").split(' ')[0],
        text: messageText,
        timestamp: Date.now()
    }).then(() => {
        chatInputField.value = "";
        globalChatRef.update({ lastMessage: messageText, lastSenderUid: currentUser.uid, lastUpdated: Date.now() });
    });
});

// ============================================================
// --- FORUM / COMMUNITY HUB ---
// ============================================================

function listenToCommunityHub() {
    db.collection('forum').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        communityGrid.innerHTML = "";
        if (snapshot.empty) return;
        const currentUid = auth.currentUser ? auth.currentUser.uid : null;
        snapshot.forEach(doc => {
            const post = doc.data(); const postId = doc.id;
            const upvotesArray = post.upvotes || []; const commentsArray = post.comments || [];
            const hasUpvoted = currentUid ? upvotesArray.includes(currentUid) : false;
            const postCard = document.createElement('div');
            postCard.className = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 h-full";
            const isOwner = currentUid === post.authorUid;
            const displayName = post.isAnonymous ? "Anonymous Homie" : (post.authorName || "Homie");
            let postAvatar = post.isAnonymous
                ? `<div class="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold"><i data-lucide="eye-off" class="w-4 h-4"></i></div>`
                : `<div class="relative"><div class="w-9 h-9 rounded-full ${getAvatarColorClass(displayName)} text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">${displayName.charAt(0)}</div><span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${userOnlineStatuses[post.authorUid] === 'online' ? 'bg-green-500' : 'bg-slate-300'}"></span></div>`;
            let commentsHtml = "";
            commentsArray.forEach(cmt => {
                commentsHtml += `<div class="bg-slate-50 rounded-xl p-2.5 text-xs border border-slate-100"><span class="font-bold text-slate-800 block">${cmt.authorName}</span><p class="text-slate-600">${cmt.content}</p></div>`;
            });
            postCard.innerHTML = `
                <div class="space-y-3 flex-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            ${postAvatar}
                            <div><h4 class="font-extrabold text-slate-900 text-xs tracking-tight leading-tight">${displayName}</h4></div>
                        </div>
                        ${isOwner ? `<button onclick="deleteForumPost('${postId}')" class="text-slate-300 hover:text-red-500 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ""}
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">${post.content}</p>
                </div>
                <div class="pt-3 border-t border-slate-100 space-y-3">
                    <div class="flex items-center gap-3 text-xs">
                        <button onclick="toggleUpvote('${postId}', '${hasUpvoted}')" class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition ${hasUpvoted ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}"><i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i> <span>${upvotesArray.length}</span></button>
                        <button onclick="document.getElementById('commentThread-${postId}').classList.toggle('hidden')" class="bg-slate-50 text-slate-600 font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> ${commentsArray.length} Replies</button>
                    </div>
                    <div id="commentThread-${postId}" class="hidden space-y-2 pt-2">
                        <div class="space-y-1.5 max-h-40 overflow-y-auto">${commentsHtml || '<p class="text-[11px] text-slate-400 py-1 italic">No replies yet.</p>'}</div>
                        <div class="flex gap-2"><input type="text" id="commentInput-${postId}" placeholder="Write a reply..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"><button onclick="submitComment('${postId}')" class="bg-slate-900 text-white font-bold text-xs px-3 rounded-xl">Send</button></div>
                    </div>
                </div>
            `;
            communityGrid.appendChild(postCard);
        });
        lucide.createIcons();
    });
}

window.toggleUpvote = function(postId, userHasUpvotedString) {
    const user = auth.currentUser; if (!user) return alert("Sign in first!");
    const postRef = db.collection('forum').doc(postId);
    if (userHasUpvotedString === "true") { postRef.update({ upvotes: firebase.firestore.FieldValue.arrayRemove(user.uid) }); }
    else { postRef.update({ upvotes: firebase.firestore.FieldValue.arrayUnion(user.uid) }); }
};

window.submitComment = function(postId) {
    const user = auth.currentUser; const input = document.getElementById(`commentInput-${postId}`);
    if (!user || !input.value.trim()) return;
    db.collection('forum').doc(postId).update({
        comments: firebase.firestore.FieldValue.arrayUnion({ authorUid: user.uid, authorName: (user.displayName || "Homie").split(' ')[0], content: input.value.trim(), createdAt: Date.now() })
    }).then(() => input.value = "");
};

communityForm.addEventListener('submit', (e) => {
    e.preventDefault(); const currentUser = auth.currentUser; if (!currentUser) return;
    db.collection('forum').add({ authorUid: currentUser.uid, authorName: currentUser.displayName || "Homie", content: document.getElementById('postContent').value, isAnonymous: document.getElementById('postAnonymous').checked, upvotes: [], comments: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => communityForm.reset());
});

window.deleteForumPost = function(postId) { if (confirm("Delete post?")) db.collection('forum').doc(postId).delete(); };

// ============================================================
// --- MARKETPLACE ---
// ============================================================

marketForm.addEventListener('submit', (e) => {
    e.preventDefault(); const currentUser = auth.currentUser; if (!currentUser) return;
    db.collection('listings').add({ sellerUid: currentUser.uid, sellerName: currentUser.displayName || "Homie", sellerEmail: currentUser.email, title: document.getElementById('itemTitle').value, category: document.getElementById('itemCategory').value, price: document.getElementById('itemPrice').value, description: document.getElementById('itemDescription').value, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => { marketForm.reset(); marketModal.classList.add('hidden'); });
});

function listenToMarketplace() {
    db.collection('listings').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        marketplaceGrid.innerHTML = "";
        if (snapshot.empty) return;
        const currentUid = auth.currentUser ? auth.currentUser.uid : null;
        snapshot.forEach(doc => {
            const item = doc.data(); const listingId = doc.id;
            const isOwner = currentUid === item.sellerUid;
            const itemCard = document.createElement('div');
            itemCard.className = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between";
            const sellerPresence = userOnlineStatuses[item.sellerUid] || 'offline';
            const sellerDotColor = sellerPresence === 'online' ? 'bg-green-500' : 'bg-slate-300';
            itemCard.innerHTML = `
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <span class="${getCategoryBadgeStyle(item.category)} text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">${item.category}</span>
                        <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">${item.price}</span>
                    </div>
                    <h4 class="font-extrabold text-slate-900 text-sm mb-1.5 leading-snug tracking-tight">${item.title}</h4>
                    <p class="text-xs text-slate-500 line-clamp-2 mb-4 bg-slate-50 border border-slate-100 p-2 rounded-xl italic">"${item.description}"</p>
                </div>
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                    <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full ${sellerDotColor} ${sellerPresence === 'online' ? 'animate-pulse' : ''}"></span>
                        By: <span class="font-semibold text-slate-600">${item.sellerName ? item.sellerName.split(' ')[0] : 'Homie'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${isOwner
                            ? `<button onclick="deleteListing('${listingId}')" class="bg-red-50 text-red-600 font-bold text-[11px] px-3 py-2 rounded-xl flex items-center gap-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</button>`
                            : `<button onclick="window.openMarketplaceChat('${item.sellerUid}', '${item.sellerName}', '${item.title.replace(/'/g, "\\'")}')" class="bg-blue-600 text-white font-bold text-[11px] px-3 py-2 rounded-xl shadow-sm flex items-center gap-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> Chat</button>`
                        }
                    </div>
                </div>
            `;
            marketplaceGrid.appendChild(itemCard);
        });
        lucide.createIcons();
    });
}

window.deleteListing = function(id) { if (confirm("Delete listing?")) db.collection('listings').doc(id).delete(); };

// ============================================================
// --- RUN CORE SERVICES ---
// ============================================================
listenToStudentNetwork();

// ============================================================
// FIRESTORE SECURITY RULES TO ADD:
//
// match /ratings/{ratingId} {
//   allow read: if true;
//   allow write: if request.auth != null
//     && request.resource.data.from == request.auth.uid
//     && request.resource.data.to != request.auth.uid;
// }
// ============================================================