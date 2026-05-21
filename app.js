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
const modalAuthTitle = document.getElementById('modalAuthTitle');
const modalAuthSubtitle = document.getElementById('modalAuthSubtitle');
const authSubmitFormBtn = document.getElementById('authSubmitFormBtn');

// Navigation Tabs Switches
const navHome = document.getElementById('navHome');
const navNetwork = document.getElementById('navNetwork');
const navCommunity = document.getElementById('navCommunity');
const navMarketplace = document.getElementById('navMarketplace');
const navMessages = document.getElementById('navMessages');
const navMyProfile = document.getElementById('navMyProfile');
const navLogo = document.getElementById('navLogo');
const homeExploreBtn = document.getElementById('homeExploreBtn');

// Display Views Layout Engine
const viewHome = document.getElementById('viewHome');
const viewNetwork = document.getElementById('viewNetwork');
const viewCommunity = document.getElementById('viewCommunity');
const viewMarketplace = document.getElementById('viewMarketplace');
const viewMessages = document.getElementById('viewMessages');
const viewMyProfile = document.getElementById('viewMyProfile');

// Core Application Feature DOM Targets
const studentCounter = document.getElementById('studentCounter');
const networkSearchInput = document.getElementById('networkSearchInput');
const networkGrid = document.getElementById('networkGrid');
const communityPostBox = document.getElementById('communityPostBox');
const communityForm = document.getElementById('communityForm');
const postContent = document.getElementById('postContent');
const postAnonymous = document.getElementById('postAnonymous');
const communityGrid = document.getElementById('communityGrid');
const openMarketModalBtn = document.getElementById('openMarketModalBtn');
const marketModal = document.getElementById('marketModal');
const closeMarketModalBtn = document.getElementById('closeMarketModalBtn');
const marketForm = document.getElementById('marketForm');
const marketplaceGrid = document.getElementById('marketplaceGrid');

// Marketplace Form Input Elements Explicit Fields
const itemTitle = document.getElementById('itemTitle');
const itemCategory = document.getElementById('itemCategory');
const itemPrice = document.getElementById('itemPrice');
const itemDescription = document.getElementById('itemDescription');

// Onboarding Modal Engine Components
const onboardingModal = document.getElementById('onboardingModal');
const onboardingForm = document.getElementById('onboardingForm');
const obCollege = document.getElementById('obCollege');
const obMajor = document.getElementById('obMajor');
const obBio = document.getElementById('obBio');
const obSkills = document.getElementById('obSkills');

// Profile Hub Workspace Panels
const myProfileAvatarBox = document.getElementById('myProfileAvatarBox');
const myProfileName = document.getElementById('myProfileName');
const myProfileHeadline = document.getElementById('myProfileHeadline');
const myProfileBio = document.getElementById('myProfileBio');
const myProfileSkillsTags = document.getElementById('myProfileSkillsTags');
const profileHubStaticView = document.getElementById('profileHubStaticView');
const profileHubForm = document.getElementById('profileHubForm');
const toggleEditHubBtn = document.getElementById('toggleEditHubBtn');
const cancelHubEditBtn = document.getElementById('cancelHubEditBtn');
const hubPhotoUrl = document.getElementById('hubPhotoUrl');
const hubCollege = document.getElementById('hubCollege');
const hubMajor = document.getElementById('hubMajor');
const hubBio = document.getElementById('hubBio');
const hubSkills = document.getElementById('hubSkills');

// Dynamic Popup Profile Viewer Layout Panel
const profileViewModal = document.getElementById('profileViewModal');
const closeProfileViewModal = document.getElementById('closeProfileViewModal');
const profileViewContent = document.getElementById('profileViewContent');

// Live P2P Chat Workspace Infrastructure
const chatSidebarList = document.getElementById('chatSidebarList');
const onlineOverviewRow = document.getElementById('onlineOverviewRow');
const chatWindowHeader = document.getElementById('chatWindowHeader');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderPresenceIndicator = document.getElementById('chatHeaderPresenceIndicator');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderItem = document.getElementById('chatHeaderItem');
const chatMessageStream = document.getElementById('chatMessageStream');
const chatFallbackPlaceholder = document.getElementById('chatFallbackPlaceholder');
const chatFormInputBar = document.getElementById('chatFormInputBar');
const chatInputField = document.getElementById('chatInputField');
const emojiToggleBtn = document.getElementById('emojiToggleBtn');
const emojiPickerPanel = document.getElementById('emojiPickerPanel');

// Ratings Metric Global Counters
const myProfileSellerRating = document.getElementById('myProfileSellerRating');
const myProfileSellerCount = document.getElementById('myProfileSellerCount');
const myProfileBuyerRating = document.getElementById('myProfileBuyerRating');
const myProfileBuyerCount = document.getElementById('myProfileBuyerCount');

// Global Architectural Runtime Variables
let currentUser = null;
let currentProfileData = null;
let activeChatRoomId = null;
let activeChatRecipientId = null;
let activeChatContextListingTitle = "";
let unreadRoomsMap = {};
let usersCache = {};
let activeAuthMode = 'login'; 

// ============================================================
// --- APP-WIDE VIEW CONTROLLER ENGINE ---
// ============================================================
const allViews = [viewHome, viewNetwork, viewCommunity, viewMarketplace, viewMessages, viewMyProfile];
const allNavButtons = [navHome, navNetwork, navCommunity, navMarketplace, navMessages, navMyProfile];

function switchView(activeViewName) {
    viewHome.classList.add('hidden');
    viewNetwork.classList.add('hidden');
    viewCommunity.classList.add('hidden');
    viewMarketplace.classList.add('hidden');
    viewMyProfile.classList.add('hidden');
    viewMessages.classList.add('hidden');

    const buttons = [navHome, navNetwork, navCommunity, navMarketplace, navMyProfile, navMessages];
    buttons.forEach(btn => {
        // Keeps the inactive state uniform with white/70 opacity as seen in your original HTML
        btn.className = "text-white/70 hover:text-white transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        btn.style.color = "";
        btn.style.borderBottom = "";
    });

    // Use your exact brand token (#2ABFBF) dynamically via inline style on activation
    if (activeViewName === 'home') {
        viewHome.classList.remove('hidden');
        navHome.className = "font-semibold transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        navHome.style.color = "#2ABFBF";
        navHome.style.borderBottom = "2px solid #2ABFBF";
    } else if (activeViewName === 'network') {
        viewNetwork.classList.remove('hidden');
        navNetwork.className = "font-semibold transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        navNetwork.style.color = "#2ABFBF";
        navNetwork.style.borderBottom = "2px solid #2ABFBF";
    } else if (activeViewName === 'community') {
        viewCommunity.classList.remove('hidden');
        navCommunity.className = "font-semibold transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        navCommunity.style.color = "#2ABFBF";
        navCommunity.style.borderBottom = "2px solid #2ABFBF";
    } else if (activeViewName === 'marketplace') {
        viewMarketplace.classList.remove('hidden');
        navMarketplace.className = "font-semibold transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        navMarketplace.style.color = "#2ABFBF";
        navMarketplace.style.borderBottom = "2px solid #2ABFBF";
    } else if (activeViewName === 'myprofile') {
        viewMyProfile.classList.remove('hidden');
        navMyProfile.className = "font-semibold transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        navMyProfile.style.color = "#2ABFBF";
        navMyProfile.style.borderBottom = "2px solid #2ABFBF";
        closeHubEditingState();
    } else if (activeViewName === 'messages') {
        viewMessages.classList.remove('hidden');
        navMessages.className = "font-semibold transition pb-1 flex items-center gap-1.5 focus:outline-none relative";
        navMessages.style.color = "#2ABFBF";
        navMessages.style.borderBottom = "2px solid #2ABFBF";
        if (activeChatId) { clearUnreadBadgeStateMarker(activeChatId); }
    }
    lucide.createIcons();
}

if (navHome) navHome.addEventListener('click', () => switchView('home'));
if (navLogo) navLogo.addEventListener('click', () => switchView('home'));
if (navNetwork) navNetwork.addEventListener('click', () => switchView('network'));
if (navCommunity) navCommunity.addEventListener('click', () => switchView('community'));
if (navMarketplace) navMarketplace.addEventListener('click', () => switchView('marketplace'));
if (navMessages) navMessages.addEventListener('click', () => switchView('messages'));
if (navMyProfile) navMyProfile.addEventListener('click', () => switchView('myprofile'));
if (homeExploreBtn) homeExploreBtn.addEventListener('click', () => switchView('network'));

function showModal(modal) { if (modal) modal.classList.remove('hidden'); }
function hideModal(modal) { if (modal) modal.classList.add('hidden'); }

if (logInBtn) logInBtn.addEventListener('click', () => openAuthModal('login'));
if (signUpBtn) signUpBtn.addEventListener('click', () => openAuthModal('signup'));
if (closeModalBtn) closeModalBtn.addEventListener('click', () => hideModal(loginModal));
if (openMarketModalBtn) openMarketModalBtn.addEventListener('click', () => showModal(marketModal));
if (closeMarketModalBtn) closeMarketModalBtn.addEventListener('click', () => hideModal(marketModal));
if (closeProfileViewModal) closeProfileViewModal.addEventListener('click', () => hideModal(profileViewModal));

function openAuthModal(mode) {
    activeAuthMode = mode;
    showModal(loginModal);
    if (mode === 'login') {
        modalAuthTitle.innerText = "Log In to Homies";
        modalAuthSubtitle.innerText = "Welcome back! Connect to your campus account.";
        authNameFieldContainer.classList.add('hidden');
        authSubmitFormBtn.innerText = "Log In";
        authName.removeAttribute('required');
    } else {
        modalAuthTitle.innerText = "Create Your Account";
        modalAuthSubtitle.innerText = "Join the verified student community today.";
        authNameFieldContainer.classList.remove('hidden');
        authSubmitFormBtn.innerText = "Sign Up";
        authName.setAttribute('required', 'true');
    }
}

// ============================================================
// --- REWRITE INTERACTION MODES: AUTH MECHANISMS ---
// ============================================================
if (emailAuthForm) {
    emailAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value;
        const nameValue = authName.value.trim();

        if (activeAuthMode === 'signup') {
            auth.createUserWithEmailAndPassword(email, password)
                .then((cred) => {
                    return cred.user.updateProfile({ displayName: nameValue });
                })
                .then(() => {
                    emailAuthForm.reset();
                    hideModal(loginModal);
                })
                .catch(err => alert(err.message));
        } else {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    emailAuthForm.reset();
                    hideModal(loginModal);
                })
                .catch(err => alert(err.message));
        }
    });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider)
            .then(() => hideModal(loginModal))
            .catch(err => alert(err.message));
    });
}

if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.reload();
        });
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        if (logInBtn) logInBtn.classList.add('hidden');
        if (signUpBtn) signUpBtn.classList.add('hidden');
        if (signOutBtn) signOutBtn.classList.remove('hidden');
        if (navMessages) navMessages.classList.remove('hidden');
        if (navMyProfile) navMyProfile.classList.remove('hidden');
        if (communityPostBox) communityPostBox.classList.remove('hidden');
        if (openMarketModalBtn) openMarketModalBtn.classList.remove('hidden');
        
        verifyUserProfileCard(user);
        listenGlobalUnreadMessages();
    } else {
        currentUser = null;
        if (logInBtn) logInBtn.classList.remove('hidden');
        if (signUpBtn) signUpBtn.classList.remove('hidden');
        if (signOutBtn) signOutBtn.classList.add('hidden');
        if (navMessages) navMessages.classList.add('hidden');
        if (navMyProfile) navMyProfile.classList.add('hidden');
        if (communityPostBox) communityPostBox.classList.add('hidden');
        if (openMarketModalBtn) openMarketModalBtn.classList.add('hidden');
    }
});

// ============================================================
// --- USER DATABASE ENTRIES & INITIAL ONBOARDING MAPS ---
// ============================================================
function verifyUserProfileCard(user) {
    db.collection('users').doc(user.uid).onSnapshot(doc => {
        if (!doc.exists) {
            showModal(onboardingModal);
        } else {
            hideModal(onboardingModal);
            currentProfileData = doc.data();
            injectMyProfileDashboardValues();
            listenToChatSidebarAndOverview();
        }
    });
}

if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const skillsArray = obSkills.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        db.collection('users').doc(currentUser.uid).set({
            uid: currentUser.uid,
            name: currentUser.displayName || "Anonymous Student",
            email: currentUser.email,
            photoUrl: currentUser.photoURL || "",
            college: obCollege.value.trim(),
            major: obMajor.value.trim(),
            bio: obBio.value.trim(),
            skills: skillsArray,
            isOnline: true,
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            hideModal(onboardingModal);
            onboardingForm.reset();
        }).catch(err => alert(err.message));
    });
}

// ============================================================
// --- MANAGING LOCAL HUB LOGIC PROFILE CONTROL ---
// ============================================================
if (toggleEditHubBtn) {
    toggleEditHubBtn.addEventListener('click', () => {
        if (!currentProfileData) return;
        profileHubStaticView.classList.add('hidden');
        profileHubForm.classList.remove('hidden');
        
        hubPhotoUrl.value = currentProfileData.photoUrl || "";
        hubCollege.value = currentProfileData.college || "";
        hubMajor.value = currentProfileData.major || "";
        hubBio.value = currentProfileData.bio || "";
        hubSkills.value = (currentProfileData.skills || []).join(', ');
    });
}

if (cancelHubEditBtn) {
    cancelHubEditBtn.addEventListener('click', () => {
        profileHubForm.classList.add('hidden');
        profileHubStaticView.classList.remove('hidden');
    });
}

if (profileHubForm) {
    profileHubForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const skillsArray = hubSkills.value.split(',').map(s => s.trim()).filter(s => s.length > 0);

        db.collection('users').doc(currentUser.uid).update({
            photoUrl: hubPhotoUrl.value.trim(),
            college: hubCollege.value.trim(),
            major: hubMajor.value.trim(),
            bio: hubBio.value.trim(),
            skills: skillsArray
        }).then(() => {
            profileHubForm.classList.add('hidden');
            profileHubStaticView.classList.remove('hidden');
        }).catch(err => alert(err.message));
    });
}

function injectMyProfileDashboardValues() {
    if (!currentProfileData) return;
    
    const initials = currentProfileData.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    if (myProfileAvatarBox) {
        if (currentProfileData.photoUrl) {
            myProfileAvatarBox.innerHTML = `<img src="${currentProfileData.photoUrl}" class="w-full h-full object-cover">`;
        } else {
            myProfileAvatarBox.innerHTML = `<span>${initials}</span>`;
            myProfileAvatarBox.className = "w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden mx-auto bg-[#2ABFBF] flex items-center justify-center text-3xl font-bold text-white uppercase relative";
        }
    }
    
    if (myProfileName) myProfileName.innerText = currentProfileData.name;
    if (myProfileHeadline) myProfileHeadline.innerText = `${currentProfileData.major} • ${currentProfileData.college}`;
    if (myProfileBio) myProfileBio.innerText = currentProfileData.bio ? `"${currentProfileData.bio}"` : `"No bio added yet."`;
    
    if (myProfileSkillsTags) {
        myProfileSkillsTags.innerHTML = "";
        (currentProfileData.skills || []).forEach(skill => {
            const span = document.createElement('span');
            span.className = "text-[10px] font-bold px-2 py-1 bg-[#F9F9F7] border border-slate-200 rounded-lg text-[#2D3748]";
            span.innerText = skill;
            myProfileSkillsTags.appendChild(span);
        });
    }

    renderTargetScoreMetrics('seller', currentUser.uid, myProfileSellerRating, myProfileSellerCount);
    renderTargetScoreMetrics('buyer', currentUser.uid, myProfileBuyerRating, myProfileBuyerCount);
}

// ============================================================
// --- RENDER DYNAMIC NETWORK PROTOCOLS & USER CARDS ---
// ============================================================
function listenToStudentNetwork() {
    db.collection('users').onSnapshot(snapshot => {
        if (studentCounter) studentCounter.innerText = `${snapshot.size} Homies Active`;
        let usersList = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            usersCache[data.uid] = data;
            usersList.push(data);
        });
        renderNetworkDirectoryGrid(usersList);
        
        if (networkSearchInput) {
            networkSearchInput.oninput = () => {
                const query = networkSearchInput.value.toLowerCase();
                const filtered = usersList.filter(u => 
                    u.name.toLowerCase().includes(query) ||
                    u.major.toLowerCase().includes(query) ||
                    u.college.toLowerCase().includes(query) ||
                    (u.skills || []).some(s => s.toLowerCase().includes(query))
                );
                renderNetworkDirectoryGrid(filtered);
            };
        }
    });
}

function renderNetworkDirectoryGrid(list) {
    if (!networkGrid) return;
    networkGrid.innerHTML = "";
    list.forEach(user => {
        const isMe = currentUser && currentUser.uid === user.uid;
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        const avatarLayout = user.photoUrl 
            ? `<img src="${user.photoUrl}" class="w-12 h-12 rounded-xl object-cover shadow-sm">`
            : `<div class="w-12 h-12 rounded-xl bg-[#2ABFBF]/10 text-[#2ABFBF] flex items-center justify-center font-bold text-sm border border-[#2ABFBF]/20 uppercase">${initials}</div>`;
            
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition duration-200";
        card.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    ${avatarLayout}
                    <div class="min-w-0">
                        <h4 class="font-heading font-bold text-sm text-[#2D3748] truncate">${user.name}</h4>
                        <p class="text-[11px] font-medium text-[#718096] truncate">${user.major}</p>
                        <p class="text-[10px] font-semibold text-[#2ABFBF] truncate">${user.college}</p>
                    </div>
                </div>
                <p class="text-xs text-[#718096] line-clamp-2 italic">"${user.bio || 'No status written.'}"</p>
                <div class="flex flex-wrap gap-1">
                    ${(user.skills || []).slice(0, 3).map(s => `<span class="text-[9px] font-bold px-2 py-0.5 bg-[#F9F9F7] border border-slate-100 rounded text-[#718096]">${s}</span>`).join('')}
                    ${(user.skills || []).length > 3 ? `<span class="text-[9px] font-bold px-2 py-0.5 text-[#2ABFBF] bg-[#2ABFBF]/5 rounded">+${user.skills.length - 3}</span>` : ''}
                </div>
            </div>
            <div class="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button onclick="window.viewExternalProfilePopup('${user.uid}')" class="flex-1 bg-[#F9F9F7] hover:bg-slate-100 text-[#2D3748] text-[11px] font-bold py-2 rounded-xl transition border border-slate-200">
                    View Profile
                </button>
                ${isMe ? '' : `
                <button onclick="window.openDirectChatWindow('${user.uid}', '${user.name.replace(/'/g, "\\'")}')" class="bg-[#2ABFBF] hover:bg-[#1A7A7A] text-white px-3 py-2 rounded-xl transition shadow-sm">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                </button>
                `}
            </div>
        `;
        networkGrid.appendChild(card);
    });
    lucide.createIcons();
}

// ============================================================
// --- COMMUNITY ANONYMOUS PLATFORM BROADCAST FEED ---
// ============================================================
if (communityForm) {
    communityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return alert("Please authenticate to broadcast updates.");
        
        db.collection('posts').add({
            content: postContent.value.trim(),
            isAnonymous: postAnonymous.checked,
            authorUid: currentUser.uid,
            authorName: currentProfileData?.name || currentUser.displayName || "Anonymous Student",
            authorPhoto: postAnonymous.checked ? "" : (currentProfileData?.photoUrl || ""),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            communityForm.reset();
        }).catch(err => alert(err.message));
    });
}

db.collection('posts').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    if (!communityGrid) return;
    communityGrid.innerHTML = "";
    snapshot.forEach(doc => {
        const post = doc.data();
        const displayAvatar = post.isAnonymous 
            ? `<div class="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700"><i data-lucide="incognito" class="w-4 h-4"></i></div>`
            : (post.authorPhoto 
                ? `<img src="${post.authorPhoto}" class="w-10 h-10 rounded-xl object-cover shadow-sm">`
                : `<div class="w-10 h-10 rounded-xl bg-[#2ABFBF]/10 text-[#2ABFBF] flex items-center justify-center font-bold text-xs border border-[#2ABFBF]/20 uppercase">${post.authorName.substring(0,2)}</div>`
              );
              
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition duration-200";
        card.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    ${displayAvatar}
                    <div>
                        <h4 class="font-heading font-bold text-xs text-[#2D3748]">${post.isAnonymous ? 'Anonymous Homie' : post.authorName}</h4>
                        <p class="text-[9px] text-[#718096] font-medium">${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                    </div>
                </div>
                <p class="text-xs text-[#2D3748] leading-relaxed whitespace-pre-wrap">${post.content}</p>
            </div>
            ${(!post.isAnonymous && currentUser && currentUser.uid !== post.authorUid) ? `
                <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button onclick="window.openDirectChatWindow('${post.authorUid}', '${post.authorName.replace(/'/g, "\\'")}')" class="bg-[#F9F9F7] hover:bg-slate-100 text-[#2D3748] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1">
                        <i data-lucide="message-square" class="w-3 h-3"></i> Direct Message
                    </button>
                </div>
            ` : ''}
        `;
        communityGrid.appendChild(card);
    });
    lucide.createIcons();
});

// ============================================================
// --- CAMPUS MARKETPLACE SYSTEM INTEGRATION INDEX ---
// ============================================================
if (marketForm) {
    marketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return alert("Log in to list dynamic resource inventory.");
        
        db.collection('listings').add({
            title: itemTitle.value.trim(),
            category: itemCategory.value,
            price: itemPrice.value.trim(),
            description: itemDescription.value.trim(),
            sellerUid: currentUser.uid,
            sellerName: currentProfileData?.name || currentUser.displayName || "Unknown User",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            hideModal(marketModal);
            marketForm.reset();
        }).catch(err => alert(err.message));
    });
}

db.collection('listings').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    if (!marketplaceGrid) return;
    marketplaceGrid.innerHTML = "";
    snapshot.forEach(doc => {
        const item = doc.data();
        const listingId = doc.id;
        const isOwner = currentUser && currentUser.uid === item.sellerUid;
        
        let categoryColor = "bg-blue-50 text-blue-600 border-blue-100";
        if (item.category === "Skill Trade") categoryColor = "bg-amber-50 text-amber-600 border-amber-100";
        if (item.category === "Electronics") categoryColor = "bg-purple-50 text-purple-600 border-purple-100";

        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between";
        card.innerHTML = `
            <div class="p-5 space-y-3">
                <div class="flex items-start justify-between gap-2">
                    <span class="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border ${categoryColor}">
                        ${item.category}
                    </span>
                    <span class="text-xs font-black text-[#1A7A7A] bg-[#E0F5F5] px-2.5 py-1 rounded-xl">
                        ${item.price}
                    </span>
                </div>
                <div class="space-y-1">
                    <h3 class="font-heading font-bold text-sm text-[#2D3748] line-clamp-1">${item.title}</h3>
                    <p class="text-[10px] font-semibold text-[#718096]">Listed by ${item.sellerName}</p>
                </div>
                <p class="text-xs text-[#718096] line-clamp-3 leading-relaxed pt-1">${item.description}</p>
            </div>
            <div class="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-[#F9F9F7]/30">
                <button onclick="window.viewExternalProfilePopup('${item.sellerUid}')" class="text-[10px] font-bold text-[#718096] hover:text-[#2D3748] underline transition">
                    View Seller
                </button>
                <div class="flex items-center gap-2">
                    ${isOwner
                        ? `<button onclick="deleteListing('${listingId}')" class="bg-red-50 text-red-600 font-bold text-[11px] px-3 py-2 rounded-xl flex items-center gap-1 border border-red-100 hover:bg-red-100 transition"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</button>`
                        : `<button onclick="window.openMarketplaceChat('${item.sellerUid}', '${item.sellerName}', '${item.title.replace(/'/g, "\\\\'")}')" class="bg-[#2ABFBF] hover:bg-[#1A7A7A] text-white font-bold text-[11px] px-3 py-2 rounded-xl shadow-sm flex items-center gap-1 transition"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> Chat</button>`
                    }
                </div>
            </div>
        `;
        marketplaceGrid.appendChild(card);
    });
    lucide.createIcons();
});

window.deleteListing = function(id) { 
    if (confirm("Delete listing permanently?")) {
        db.collection('listings').doc(id).delete(); 
    }
};

// ============================================================
// --- LIVE PEER TO PEER CHAT ARCHITECTURE SYSTEM ---
// ============================================================
function listenGlobalUnreadMessages() {
    if (!currentUser) return;
    db.collection('rooms').where('participants', 'array-contains', currentUser.uid).onSnapshot(snapshot => {
        let globalUnreadCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            const unreadCount = data.unreadCount?.[currentUser.uid] || 0;
            unreadRoomsMap[doc.id] = unreadCount;
            globalUnreadCount += unreadCount;
        });
        if (globalUnreadBadge) {
            if (globalUnreadCount > 0) {
                globalUnreadBadge.innerText = globalUnreadCount;
                globalUnreadBadge.classList.remove('hidden');
            } else {
                globalUnreadBadge.classList.add('hidden');
            }
        }
    });
}

function listenToChatSidebarAndOverview() {
    if (!currentUser) return;
    
    db.collection('users').where('isOnline', '==', true).onSnapshot(snapshot => {
        if (!onlineOverviewRow) return;
        onlineOverviewRow.innerHTML = "";
        let count = 0;
        snapshot.forEach(doc => {
            const u = doc.data();
            if (u.uid === currentUser.uid) return;
            count++;
            
            const initials = u.name.split(' ').map(n => n[0]).join('').substring(0,2);
            const entry = document.createElement('div');
            entry.className = "flex flex-col items-center flex-shrink-0 cursor-pointer group";
            entry.onclick = () => window.openDirectChatWindow(u.uid, u.name);
            entry.innerHTML = `
                <div class="relative">
                    ${u.photoUrl 
                        ? `<img src="${u.photoUrl}" class="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#2ABFBF] transition">` 
                        : `<div class="w-9 h-9 rounded-full bg-[#2ABFBF]/10 text-[#2ABFBF] flex items-center justify-center font-bold text-xs border border-[#2ABFBF]/20 uppercase">${initials}</div>`
                    }
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <span class="text-[9px] text-[#718096] font-bold max-w-[48px] truncate mt-1 group-hover:text-[#2D3748]">${u.name.split(' ')[0]}</span>
            `;
            onlineOverviewRow.appendChild(entry);
        });
        if(count === 0) {
            onlineOverviewRow.innerHTML = `<span class="text-[10px] text-[#718096] italic py-1">No other homies online</span>`;
        }
    });

    db.collection('rooms').where('participants', 'array-contains', currentUser.uid).orderBy('lastMessageAt', 'desc').onSnapshot(snapshot => {
        if (!chatSidebarList) return;
        chatSidebarList.innerHTML = "";
        snapshot.forEach(doc => {
            const room = doc.data();
            const roomId = doc.id;
            const targetId = room.participants.find(p => p !== currentUser.uid);
            if (!targetId) return;

            const unread = room.unreadCount?.[currentUser.uid] || 0;
            
            db.collection('users').doc(targetId).get().then(userDoc => {
                if (!userDoc.exists) return;
                const user = userDoc.data();
                const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2);
                
                const row = document.createElement('div');
                row.id = `sidebar-room-${roomId}`;
                const isActive = roomId === activeChatRoomId;
                
                row.className = `p-3 flex items-center gap-3 cursor-pointer transition ${isActive ? 'bg-[#2ABFBF]/10 border-l-4 border-[#2ABFBF]' : 'hover:bg-[#F9F9F7]'}`;
                row.onclick = () => selectActiveChatConversationRoom(roomId, user, room.contextListingTitle || "");
                
                row.innerHTML = `
                    <div class="relative flex-shrink-0">
                        ${user.photoUrl ? `<img src="${user.photoUrl}" class="w-10 h-10 rounded-full object-cover">` : `<div class="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">${initials}</div>`}
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-500' : 'bg-slate-400'}"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                            <h4 class="font-heading font-bold text-xs text-[#2D3748] truncate">${user.name}</h4>
                            <span class="text-[9px] text-[#718096] whitespace-nowrap">${room.lastMessageAt ? new Date(room.lastMessageAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                        </div>
                        <p class="text-[11px] ${unread > 0 ? 'font-black text-[#2D3748]' : 'text-[#718096]'} truncate mt-0.5">${room.lastMessageText || 'No messages yet'}</p>
                        ${room.contextListingTitle ? `<p class="text-[9px] font-bold text-[#2ABFBF] truncate mt-0.5 flex items-center gap-0.5"><i data-lucide="tag" class="w-2.5 h-2.5"></i> ${room.contextListingTitle}</p>` : ''}
                    </div>
                    ${unread > 0 ? `<div class="bg-[#2ABFBF] text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">${unread}</div>` : ''}
                `;
                chatSidebarList.appendChild(row);
                lucide.createIcons();
            });
        });
    });
}

window.openDirectChatWindow = function(targetUid, targetName) {
    if (!currentUser) return alert("Please authenticate to message other users.");
    if (currentUser.uid === targetUid) return;
    
    switchView(viewMessages, navMessages);
    const generatedRoomId = currentUser.uid < targetUid ? `${currentUser.uid}_${targetUid}` : `${targetUid}_${currentUser.uid}`;
    
    db.collection('users').doc(targetUid).get().then(doc => {
        if (doc.exists) {
            selectActiveChatConversationRoom(generatedRoomId, doc.data(), "");
        }
    });
};

window.openMarketplaceChat = function(sellerUid, sellerName, itemTitleStr) {
    if (!currentUser) return alert("Log in to contact platform context provider sellers.");
    if (currentUser.uid === sellerUid) return;

    switchView(viewMessages, navMessages);
    const generatedRoomId = currentUser.uid < sellerUid ? `${currentUser.uid}_${sellerUid}_listing` : `${sellerUid}_${currentUser.uid}_listing`;

    db.collection('users').doc(sellerUid).get().then(doc => {
        if (doc.exists) {
            selectActiveChatConversationRoom(generatedRoomId, doc.data(), itemTitleStr);
        }
    });
};

function selectActiveChatConversationRoom(roomId, recipientUserObj, contextListingStr) {
    activeChatRoomId = roomId;
    activeChatRecipientId = recipientUserObj.uid;
    activeChatContextListingTitle = contextListingStr || "";

    if (chatFallbackPlaceholder) chatFallbackPlaceholder.classList.add('hidden');
    if (chatWindowHeader) chatWindowHeader.classList.remove('hidden');
    if (chatFormInputBar) chatFormInputBar.classList.remove('hidden');

    const initials = recipientUserObj.name.split(' ').map(n => n[0]).join('').substring(0,2);
    if (chatHeaderAvatar) {
        if (recipientUserObj.photoUrl) {
            chatHeaderAvatar.innerHTML = `<img src="${recipientUserObj.photoUrl}" class="w-full h-full object-cover rounded-full">`;
        } else {
            chatHeaderAvatar.innerHTML = `<span>${initials}</span>`;
            chatHeaderAvatar.className = "w-10 h-10 rounded-full bg-[#2ABFBF] flex items-center justify-center text-sm font-bold text-white uppercase";
        }
    }

    if (chatHeaderPresenceIndicator) {
        chatHeaderPresenceIndicator.className = `absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${recipientUserObj.isOnline ? 'bg-green-500' : 'bg-slate-400'}`;
        chatHeaderPresenceIndicator.classList.remove('hidden');
    }

    if (chatHeaderName) chatHeaderName.innerText = recipientUserObj.name;
    if (chatHeaderItem) chatHeaderItem.innerHTML = contextListingStr ? `<span class="flex items-center gap-1"><i data-lucide="shopping-bag" class="w-3 h-3"></i> Ref: ${contextListingStr}</span>` : "";
    lucide.createIcons();

    db.collection('rooms').doc(roomId).set({
        participants: [currentUser.uid, recipientUserObj.uid],
        contextListingTitle: activeChatContextListingTitle
    }, { merge: true }).then(() => {
        db.collection('rooms').doc(roomId).update({
            [`unreadCount.${currentUser.uid}`]: 0
        });
    });

    db.collection('rooms').doc(roomId).collection('messages').orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        if (!chatMessageStream) return;
        chatMessageStream.innerHTML = "";
        snapshot.forEach(doc => {
            const msg = doc.data();
            const isMe = msg.senderId === currentUser.uid;
            
            const messageRow = document.createElement('div');
            messageRow.className = `flex ${isMe ? 'justify-end' : 'justify-start'} w-full`;
            
            const bubble = document.createElement('div');
            bubble.className = `max-w-[75%] px-3.5 py-2 rounded-2xl text-xs shadow-sm ${
                isMe 
                    ? 'bg-[#2ABFBF] text-white rounded-tr-none' 
                    : 'bg-white text-[#2D3748] rounded-tl-none border border-slate-200'
            }`;
            
            bubble.innerHTML = `
                <p class="whitespace-pre-wrap leading-relaxed">${msg.text}</p>
                <span class="text-[8px] block text-right mt-1 opacity-70">${msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
            `;
            
            messageRow.appendChild(bubble);
            chatMessageStream.appendChild(messageRow);
        });
        scrollToChatBottom();
    });
}

if (chatFormInputBar) {
    chatFormInputBar.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser || !activeChatRoomId || !activeChatRecipientId) return;

        const messageText = chatInputField.value.trim();
        if (!messageText) return;

        chatInputField.value = "";
        hideModal(emojiPickerPanel);

        const messagePayload = {
            text: messageText,
            senderId: currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('rooms').doc(activeChatRoomId).collection('messages').add(messagePayload).then(() => {
            return db.collection('rooms').doc(activeChatRoomId).set({
                lastMessageText: messageText,
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                participants: [currentUser.uid, activeChatRecipientId],
                contextListingTitle: activeChatContextListingTitle,
                [`unreadCount.${activeChatRecipientId}`]: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
        }).catch(err => alert(err.message));
    });
}

function scrollToChatBottom() {
    if (chatMessageStream) chatMessageStream.scrollTop = chatMessageStream.scrollHeight;
}

if (emojiToggleBtn) {
    emojiToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (emojiPickerPanel) emojiPickerPanel.classList.toggle('hidden');
    });
}
document.querySelectorAll('.emoji-opt').forEach(emojiEl => {
    emojiEl.addEventListener('click', () => {
        if (chatInputField) {
            chatInputField.value += emojiEl.innerText;
            hideModal(emojiPickerPanel);
            chatInputField.focus();
        }
    });
});
document.addEventListener('click', () => hideModal(emojiPickerPanel));

// ============================================================
// --- COMPONENT PLUGIN: EXTERNAL POPUP DETAIL VIEWER ---
// ============================================================
window.viewExternalProfilePopup = function(uid) {
    showModal(profileViewModal);
    if (profileViewContent) profileViewContent.innerHTML = `<div class="p-8 text-center text-xs font-semibold text-[#718096]">Compiling network user statistics...</div>`;
    
    db.collection('users').doc(uid).get().then(doc => {
        if (!doc.exists || !profileViewContent) return;
        const user = doc.data();
        const isMe = currentUser && currentUser.uid === user.uid;
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2);
        
        const avatarMarkup = user.photoUrl 
            ? `<img src="${user.photoUrl}" class="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white shadow-md">`
            : `<div class="w-20 h-20 rounded-full bg-[#2ABFBF] text-white text-2xl font-bold flex items-center justify-center mx-auto border-4 border-white shadow-md uppercase">${initials}</div>`;
            
        profileViewContent.innerHTML = `
            <div class="h-24 bg-gradient-to-r from-[#2ABFBF] to-[#1A7A7A]"></div>
            <div class="px-6 pb-6 text-center -mt-10 space-y-4">
                ${avatarMarkup}
                <div class="space-y-1">
                    <h3 class="font-heading font-extrabold text-xl text-[#2D3748]">${user.name}</h3>
                    <p class="text-xs font-bold text-[#2ABFBF]">${user.major}</p>
                    <p class="text-[11px] font-semibold text-[#718096]">${user.college}</p>
                </div>
                <p class="text-xs italic text-[#718096] bg-[#F9F9F7] p-3 rounded-xl border border-slate-100">"${user.bio || 'No status written.'}"</p>
                
                <div class="flex justify-between py-3 border-y border-slate-100">
                    <div class="w-1/2 border-r border-slate-100">
                        <span class="text-[9px] font-extrabold text-[#718096] uppercase block tracking-wider">Provider Rating</span>
                        <div id="modalSellerStars" class="flex justify-center py-1"></div>
                        <span id="modalSellerRatingText" class="text-[10px] font-bold text-[#2D3748]">0.0 (0 reviews)</span>
                    </div>
                    <div class="w-1/2">
                        <span class="text-[9px] font-extrabold text-[#718096] uppercase block tracking-wider">Homie Rating</span>
                        <div id="modalBuyerStars" class="flex justify-center py-1"></div>
                        <span id="modalBuyerRatingText" class="text-[10px] font-bold text-[#2D3748]">0.0 (0 reviews)</span>
                    </div>
                </div>

                <div class="text-left space-y-1.5">
                    <span class="text-[10px] font-extrabold text-[#718096] uppercase tracking-wider block">Skills Inventory</span>
                    <div class="flex flex-wrap gap-1">
                        ${(user.skills || []).map(s => `<span class="text-[10px] font-bold px-2 py-0.5 bg-[#F9F9F7] border border-slate-200 rounded text-[#2D3748]">${s}</span>`).join('')}
                    </div>
                </div>

                ${isMe ? '' : `
                <div class="pt-2 grid grid-cols-2 gap-2">
                    <button id="modalRateSellerBtn" class="bg-[#2ABFBF] hover:bg-[#1A7A7A] text-white text-[11px] font-bold py-2.5 rounded-xl transition shadow-sm">Rate Provider</button>
                    <button id="modalRateBuyerBtn" class="bg-[#2D3748] hover:bg-slate-800 text-white text-[11px] font-bold py-2.5 rounded-xl transition shadow-sm">Rate Homie</button>
                </div>
                <button onclick="window.closeProfileModalAndChat('${user.uid}', '${user.name.replace(/'/g, "\\'")}')" class="w-full bg-[#FF6B6B] hover:bg-[#E05555] text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
                    <i data-lucide="message-circle" class="w-4 h-4"></i> Message Homie
                </button>
                `}
            </div>
        `;
        lucide.createIcons();
        
        buildInteractiveReviewSystemPopupScore(uid, 'seller');
        buildInteractiveReviewSystemPopupScore(uid, 'buyer');
        
        if (!isMe) {
            document.getElementById('modalRateSellerBtn').onclick = () => inititateRatingSubmissionProcessTransaction(uid, 'seller');
            document.getElementById('modalRateBuyerBtn').onclick = () => inititateRatingSubmissionProcessTransaction(uid, 'buyer');
        }
    });
};

window.closeProfileModalAndChat = function(uid, name) {
    hideModal(profileViewModal);
    window.openDirectChatWindow(uid, name);
};

// ============================================================
// --- ADVANCED RATINGS ENGINE & METRICS CALCULATOR ---
// ============================================================
function renderTargetScoreMetrics(type, targetUid, ratingTargetEl, countTargetEl) {
    db.collection('ratings').where('targetUid', '==', targetUid).where('type', '==', type).onSnapshot(snap => {
        if (snap.empty) {
            if (ratingTargetEl) ratingTargetEl.innerText = "New";
            if (countTargetEl) countTargetEl.innerText = "0 reviews";
            return;
        }
        let total = 0;
        snap.forEach(d => total += d.data().stars);
        const avg = (total / snap.size).toFixed(1);
        if (ratingTargetEl) ratingTargetEl.innerText = `${avg} / 5.0`;
        if (countTargetEl) countTargetEl.innerText = `${snap.size} review${snap.size > 1 ? 's' : ''}`;
    });
}

function buildInteractiveReviewSystemPopupScore(targetUid, type) {
    const starsContainer = document.getElementById(type === 'seller' ? 'modalSellerStars' : 'modalBuyerStars');
    const labelText = document.getElementById(type === 'seller' ? 'modalSellerRatingText' : 'modalBuyerRatingText');
    
    db.collection('ratings').where('targetUid', '==', targetUid).where('type', '==', type).onSnapshot(snap => {
        if (!starsContainer || !labelText) return;
        if (snap.empty) {
            starsContainer.innerHTML = `<span class="text-[#718096] text-xs">Unrated</span>`;
            labelText.innerText = "0.0 (0 reviews)";
            return;
        }
        let total = 0;
        snap.forEach(d => total += d.data().stars);
        const avg = total / snap.size;
        
        starsContainer.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= Math.round(avg);
            starsContainer.innerHTML += `<i data-lucide="star" class="w-3.5 h-3.5 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}"></i>`;
        }
        labelText.innerText = `${avg.toFixed(1)} (${snap.size} review${snap.size > 1 ? 's' : ''})`;
        lucide.createIcons();
    });
}

function inititateRatingSubmissionProcessTransaction(targetUid, type) {
    if (!currentUser) return alert("Log in to leave verified operational quality feedback scores.");
    
    const promptValue = prompt(`Rate this user as a ${type.toUpperCase()} (Enter an integer from 1 to 5):`);
    if (promptValue === null) return;
    
    const starScore = parseInt(promptValue);
    if (isNaN(starScore) || starScore < 1 || starScore > 5) {
        return alert("Invalid entry. Please evaluate exactly between 1 and 5 stars.");
    }
    
    const trackingDocId = `${currentUser.uid}_${targetUid}_${type}`;
    db.collection('ratings').doc(trackingDocId).set({
        type: type,
        sourceUid: currentUser.uid,
        targetUid: targetUid,
        stars: starScore,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Your evaluation scorecard was broadcast successfully.");
        buildInteractiveReviewSystemPopupScore(targetUid, type);
    }).catch(err => alert(err.message));
}

// ============================================================
// --- RUN CORE SERVICES ---
// ============================================================
listenToStudentNetwork();