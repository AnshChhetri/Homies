const firebaseConfig = {
  apiKey: "AIzaSyDfBpznXuifN0FF6i4OPYSPxlgu16ER3gI",
  authDomain: "homies-9d0a5.firebaseapp.com",
  projectId: "homies-9d0a5",
  storageBucket: "homies-9d0a5.firebasestorage.app",
  messagingSenderId: "203127709993",
  appId: "1:203127709993:web:c29a1b36aba3e01dd6d738"
};

// Core Backends Instantiation Pipeline
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); 
const googleProvider = new firebase.auth.GoogleAuthProvider();

// DOM Selector Architecture Binds
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn'); 
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// View Layout Targets
const viewHome = document.getElementById('viewHome');
const viewNetwork = document.getElementById('viewNetwork');
const viewCommunity = document.getElementById('viewCommunity');
const viewMarketplace = document.getElementById('viewMarketplace');
const viewMyProfile = document.getElementById('viewMyProfile'); 
const viewMessages = document.getElementById('viewMessages'); 

// Navigation Anchors
const navHome = document.getElementById('navHome');
const navNetwork = document.getElementById('navNetwork');
const navCommunity = document.getElementById('navCommunity');
const navMarketplace = document.getElementById('navMarketplace');
const navMyProfile = document.getElementById('navMyProfile'); 
const navMessages = document.getElementById('navMessages'); 
const navLogo = document.getElementById('navLogo');
const homeExploreBtn = document.getElementById('homeExploreBtn');

// Emoji Picker Specific Structural Handles
const emojiToggleBtn = document.getElementById('emojiToggleBtn');
const emojiPickerPanel = document.getElementById('emojiPickerPanel');

// Profile Hub Workspace Selectors
const toggleEditHubBtn = document.getElementById('toggleEditHubBtn');
const profileHubStaticView = document.getElementById('profileHubStaticView');
const profileHubForm = document.getElementById('profileHubForm');
const cancelHubEditBtn = document.getElementById('cancelHubEditBtn');

const hubPhotoUrl = document.getElementById('hubPhotoUrl');
const hubCollege = document.getElementById('hubCollege');
const hubMajor = document.getElementById('hubMajor');
const hubBio = document.getElementById('hubBio');
const hubSkills = document.getElementById('hubSkills');
const hubLinkedIn = document.getElementById('hubLinkedIn');
const hubGitHub = document.getElementById('hubGitHub');

// Dynamic Feeds Node Targets
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

// Chat View Layout Elements
const chatSidebarList = document.getElementById('chatSidebarList');
const chatWindowHeader = document.getElementById('chatWindowHeader');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderItem = document.getElementById('chatHeaderItem');
const chatMessageStream = document.getElementById('chatMessageStream');
const chatFormInputBar = document.getElementById('chatFormInputBar');
const chatInputField = document.getElementById('chatInputField');
const chatFallbackPlaceholder = document.getElementById('chatFallbackPlaceholder');

let activeChatId = null;
let chatMessagesUnsubscribe = null;
let allStudentsCache = []; 

// --- SINGLE PAGE ROUTER ENGINE ---
function switchView(activeViewName) {
    viewHome.classList.add('hidden');
    viewNetwork.classList.add('hidden');
    viewCommunity.classList.add('hidden');
    viewMarketplace.classList.add('hidden');
    viewMyProfile.classList.add('hidden');
    viewMessages.classList.add('hidden');

    const buttons = [navHome, navNetwork, navCommunity, navMarketplace, navMyProfile, navMessages];
    buttons.forEach(btn => {
        btn.className = "text-slate-300 hover:text-white transition pb-1 flex items-center gap-1.5 focus:outline-none";
    });

    if (activeViewName === 'home') {
        viewHome.classList.remove('hidden');
        navHome.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none";
    } else if (activeViewName === 'network') {
        viewNetwork.classList.remove('hidden');
        navNetwork.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none";
    } else if (activeViewName === 'community') {
        viewCommunity.classList.remove('hidden');
        navCommunity.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none";
    } else if (activeViewName === 'marketplace') {
        viewMarketplace.classList.remove('hidden');
        navMarketplace.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none";
    } else if (activeViewName === 'myprofile') {
        viewMyProfile.classList.remove('hidden');
        navMyProfile.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none";
        closeHubEditingState();
    } else if (activeViewName === 'messages') {
        viewMessages.classList.remove('hidden');
        navMessages.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 flex items-center gap-1.5 focus:outline-none";
    }
    // Synchronize rendering state parameters for vector graphics elements
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

// --- INLINE INTEGRATED EMOJI KEYBOARD ENGINE ---
emojiToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPickerPanel.classList.toggle('hidden');
});

// Close floating layout when clicking outside the container context grid
document.addEventListener('click', (e) => {
    if (!emojiPickerPanel.contains(e.target) && e.target !== emojiToggleBtn) {
        emojiPickerPanel.classList.add('hidden');
    }
});

document.querySelectorAll('.emoji-opt').forEach(emojiElement => {
    emojiElement.addEventListener('click', () => {
        const insertionEmoji = emojiElement.innerText;
        chatInputField.value += insertionEmoji;
        emojiPickerPanel.classList.add('hidden');
        chatInputField.focus();
    });
});

// --- HELPER GRAPHICS HANDLERS ---
function getAvatarColorClass(name) {
    if (!name) return "bg-slate-800";
    const colors = ["bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600", "bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-purple-600", "bg-pink-600", "bg-teal-600", "bg-orange-600"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getCategoryBadgeStyle(category) {
    switch(category) {
        case 'Skill Trade': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'Books & Notes': return 'bg-purple-50 text-purple-700 border border-purple-200';
        case 'Electronics': return 'bg-amber-50 text-amber-700 border border-amber-200';
        default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
}

signInBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => loginModal.classList.add('hidden'));
openMarketModalBtn.addEventListener('click', () => marketModal.classList.remove('hidden'));
closeMarketModalBtn.addEventListener('click', () => marketModal.classList.add('hidden'));

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
    if (e.target === marketModal) marketModal.classList.add('hidden');
});

// --- GOOGLE SECURITY LINK AGENT ---
googleLoginBtn.addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(result => {
            loginModal.classList.add('hidden'); 
            checkUserProfile(result.user);     
        }).catch(() => alert("Authentication engine dropped."));
});

signOutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        switchView('home'); 
    });
});

auth.onAuthStateChanged(user => {
    if (user) {
        signInBtn.innerText = `${user.displayName.split(' ')[0]}`;
        signInBtn.className = "bg-slate-950 text-white text-xs uppercase tracking-wide font-bold px-5 py-2.5 rounded-xl border border-slate-800 shadow-sm";
        signOutBtn.classList.remove('hidden');
        openMarketModalBtn.classList.remove('hidden');
        communityPostBox.classList.remove('hidden'); 
        navMyProfile.classList.remove('hidden'); 
        navMessages.classList.remove('hidden'); 
        document.getElementById('currentUserNameInbox').innerText = user.displayName.toLowerCase().replace(/\s+/g, '_');
        
        renderMyShowcaseDashboard(user.uid);
        listenToUserInboxChats();
    } else {
        signInBtn.innerText = "Sign In";
        signInBtn.className = "bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition text-xs uppercase tracking-wide shadow-md";
        signOutBtn.classList.add('hidden');
        openMarketModalBtn.classList.add('hidden');
        communityPostBox.classList.add('hidden'); 
        navMyProfile.classList.add('hidden'); 
        navMessages.classList.add('hidden'); 
        marketModal.classList.add('hidden');
        
        if(chatMessagesUnsubscribe) chatMessagesUnsubscribe();
        chatSidebarList.innerHTML = "";
    }
    listenToMarketplace();
    listenToCommunityHub();
});

// --- PROFILE SETTINGS SYNCHRONIZER ENGINE ---
function renderMyShowcaseDashboard(uid) {
    db.collection('users').doc(uid).onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('myProfileName').innerText = data.fullName || "Student Homie";
        document.getElementById('myProfileHeadline').innerText = `🎓 ${data.major || 'Undecided'} at ${data.collegeName || 'Global Campus'}`;
        document.getElementById('myProfileBio').innerText = data.bio ? `"${data.bio}"` : '"No bio set yet."';

        const avatarBox = document.getElementById('myProfileAvatarBox');
        if (data.photoUrl) {
            avatarBox.innerHTML = `<img src="${data.photoUrl}" class="w-full h-full object-cover rounded-full">`;
        } else {
            avatarBox.className = `w-24 h-24 rounded-full border-4 border-white ${getAvatarColorClass(data.fullName)} shadow-md flex items-center justify-center text-3xl font-bold text-white uppercase`;
            avatarBox.innerText = data.fullName ? data.fullName.charAt(0) : "H";
        }

        const tagsContainer = document.getElementById('myProfileSkillsTags');
        tagsContainer.innerHTML = "";
        if (data.skills) {
            data.skills.split(',').forEach(skill => {
                if(!skill.trim()) return;
                const span = document.createElement('span');
                span.className = "bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100";
                span.innerText = skill.trim();
                tagsContainer.appendChild(span);
            });
        }

        const lnk = document.getElementById('myProfileLinkedIn');
        if (data.linkedin) { lnk.href = data.linkedin; lnk.classList.remove('hidden'); } else { lnk.classList.add('hidden'); }
        const gth = document.getElementById('myProfileGitHub');
        if (data.github) { gth.href = data.github; gth.classList.remove('hidden'); } else { gth.classList.add('hidden'); }

        hubPhotoUrl.value = data.photoUrl || "";
        hubCollege.value = data.collegeName || "";
        hubMajor.value = data.major || "";
        hubBio.value = data.bio || "";
        hubSkills.value = data.skills || "";
        hubLinkedIn.value = data.linkedin || "";
        hubGitHub.value = data.github || "";
        lucide.createIcons();
    });
}

function checkUserProfile(user) {
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            switchView('myprofile');
            if (!doc.exists) openHubEditingState();
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
    if (profileHubForm.classList.contains('hidden')) {
        openHubEditingState();
    } else {
        closeHubEditingState();
    }
});

cancelHubEditBtn.addEventListener('click', closeHubEditingState);

profileHubForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    db.collection('users').doc(currentUser.uid).set({
        uid: currentUser.uid,
        fullName: currentUser.displayName,
        email: currentUser.email,
        photoUrl: hubPhotoUrl.value.trim() || currentUser.photoURL || "",
        collegeName: hubCollege.value.trim(),
        major: hubMajor.value.trim(),
        bio: hubBio.value.trim(),
        skills: hubSkills.value.trim(),
        linkedin: hubLinkedIn.value.trim(),
        github: hubGitHub.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => {
        closeHubEditingState();
    });
});

// --- ROSTER DIRECTORY ---
function listenToStudentNetwork() {
    db.collection('users').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            allStudentsCache = []; 
            studentCounter.innerText = `${snapshot.size} Homies Active`;
            if (snapshot.empty) return;
            snapshot.forEach(doc => { allStudentsCache.push(doc.data()); });
            renderFilteredNetwork(allStudentsCache);
        });
}

function renderFilteredNetwork(studentsArray) {
    networkGrid.innerHTML = "";
    if (studentsArray.length === 0) {
        networkGrid.innerHTML = `<div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 p-6"><p class="text-slate-400 text-xs font-semibold">No students found matching query configuration parameters.</p></div>`;
        return;
    }

    studentsArray.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full";
        let avatarLayout = student.photoUrl ? `<img src="${student.photoUrl}" class="w-10 h-10 rounded-full object-cover shadow-sm">` : `<div class="w-10 h-10 rounded-full ${getAvatarColorClass(student.fullName)} text-white font-bold flex items-center justify-center text-sm uppercase shadow-sm">${student.fullName ? student.fullName.charAt(0) : 'H'}</div>`;

        let skillsChips = "";
        if(student.skills) {
            student.skills.split(',').forEach(sk => {
                if(!sk.trim()) return;
                skillsChips += `<span class="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md">${sk.trim()}</span>`;
            });
        }

        studentCard.innerHTML = `
            <div>
                <div class="flex items-center gap-3 mb-3">
                    ${avatarLayout}
                    <div>
                        <h4 class="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">${student.fullName || 'Anonymous Homie'}</h4>
                        <p class="text-[11px] text-blue-600 font-semibold">${student.major || 'Undecided'}</p>
                    </div>
                </div>
                <p class="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${student.collegeName || 'Global Campus'}</p>
                <p class="text-xs text-slate-600 line-clamp-2 italic mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">"${student.bio || 'Hello, lets connect!'}"</p>
                <div class="space-y-1">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Skills Inventory:</span>
                    <div class="flex flex-wrap gap-1">${skillsChips || '<span class="text-slate-400 text-xs">Exploring...</span>'}</div>
                </div>
            </div>
            <div class="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                <a href="mailto:${student.email}" class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-xl transition text-center flex items-center justify-center gap-1.5"><i data-lucide="mail" class="w-3.5 h-3.5"></i> Email</a>
            </div>
        `;
        networkGrid.appendChild(studentCard);
    });
    lucide.createIcons();
}

document.getElementById('networkSearchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { renderFilteredNetwork(allStudentsCache); return; }
    const filtered = allStudentsCache.filter(student => {
        return (student.fullName || "").toLowerCase().includes(query) || 
               (student.major || "").toLowerCase().includes(query) || 
               (student.collegeName || "").toLowerCase().includes(query) || 
               (student.skills || "").toLowerCase().includes(query);
    });
    renderFilteredNetwork(filtered);
});

// --- MESSAGING CHANNEL MECHANICS ---
window.openMarketplaceChat = function(sellerUid, sellerName, listingTitle) {
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("Sign in to contact sellers!");
    if (currentUser.uid === sellerUid) return alert("Your listing!");

    const combinedChatId = `${currentUser.uid}_${sellerUid}_${listingTitle.replace(/\s+/g, '')}`;

    db.collection('chats').doc(combinedChatId).set({
        chatId: combinedChatId,
        participants: [currentUser.uid, sellerUid],
        buyerName: currentUser.displayName,
        sellerName: sellerName,
        listingTitle: listingTitle,
        lastMessage: "Conversation opened...",
        lastUpdated: Date.now()
    }, { merge: true }).then(() => {
        switchView('messages');
        loadActiveChatMessageStream(combinedChatId, sellerName, listingTitle);
    });
};

function listenToUserInboxChats() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .onSnapshot(snapshot => {
            chatSidebarList.innerHTML = "";
            if (snapshot.empty) {
                chatSidebarList.innerHTML = `<p class="text-center text-xs text-slate-400 py-12 italic">No active message pipelines linked.</p>`;
                return;
            }

            snapshot.forEach(doc => {
                const chat = doc.data();
                const isBuyer = currentUser.uid === chat.participants[0];
                const displayPeerName = isBuyer ? chat.sellerName : chat.buyerName;
                const activeBarIndicator = activeChatId === chat.chatId ? 'bg-slate-50 font-bold border-l-4 border-slate-900' : '';
                
                const sidebarItemRow = document.createElement('button');
                sidebarItemRow.className = `w-full text-left px-5 py-3.5 hover:bg-slate-50/80 transition flex items-center gap-3 outline-none ${activeBarIndicator}`;
                
                sidebarItemRow.innerHTML = `
                    <div class="w-11 h-11 rounded-full ${getAvatarColorClass(displayPeerName)} text-white font-extrabold text-sm flex items-center justify-center uppercase shadow-sm">
                        ${displayPeerName.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="text-slate-900 text-sm font-semibold block truncate">${displayPeerName}</span>
                        <p class="text-xs text-slate-400 truncate mt-0.5">${chat.lastMessage || 'Sent a message'}</p>
                        <span class="text-[9px] bg-slate-100 text-slate-500 font-bold tracking-tight px-1.5 py-0.5 rounded mt-1 inline-block">🏷️ ${chat.listingTitle}</span>
                    </div>
                `;
                
                sidebarItemRow.addEventListener('click', () => {
                    loadActiveChatMessageStream(chat.chatId, displayPeerName, chat.listingTitle);
                });
                chatSidebarList.appendChild(sidebarItemRow);
            });
        });
}

function loadActiveChatMessageStream(chatId, peerName, listingTitle) {
    activeChatId = chatId;
    
    chatFallbackPlaceholder.classList.add('hidden');
    chatWindowHeader.classList.remove('hidden');
    chatFormInputBar.classList.remove('hidden');
    
    chatHeaderName.innerText = peerName;
    chatHeaderItem.innerText = `Marketplace Post: ${listingTitle}`;
    chatHeaderAvatar.className = `w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider ${getAvatarColorClass(peerName)}`;
    chatHeaderAvatar.innerText = peerName.charAt(0);

    if(chatMessagesUnsubscribe) chatMessagesUnsubscribe();

    chatMessagesUnsubscribe = db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            chatMessageStream.innerHTML = "";
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMe = msg.senderUid === currentUid;
                const messageRowWrapper = document.createElement('div');
                messageRowWrapper.className = `flex w-full ${isMe ? 'justify-end' : 'justify-start'}`;

                messageRowWrapper.innerHTML = `
                    <div class="max-w-[70%] rounded-2xl px-4 py-2.5 text-xs transition tracking-tight ${isMe ? 'bg-blue-600 text-white rounded-br-sm font-semibold shadow-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm font-normal'}">
                        <p class="whitespace-pre-wrap leading-snug">${msg.text}</p>
                    </div>
                `;
                chatMessageStream.appendChild(messageRowWrapper);
            });
            chatMessageStream.scrollTop = chatMessageStream.scrollHeight;
        });
    lucide.createIcons();
}

chatFormInputBar.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    const messageText = chatInputField.value.trim();
    if (!currentUser || !messageText || !activeChatId) return;

    const messagesRef = db.collection('chats').doc(activeChatId).collection('messages');
    const globalChatRef = db.collection('chats').doc(activeChatId);

    const messagePayload = {
        senderUid: currentUser.uid,
        senderName: currentUser.displayName.split(' ')[0],
        text: messageText,
        timestamp: Date.now()
    };

    messagesRef.add(messagePayload).then(() => {
        chatInputField.value = ""; 
        globalChatRef.update({ lastMessage: messageText, lastUpdated: Date.now() });
    });
});

// --- DISCUSSIONS ARCHITECTURE ---
function listenToCommunityHub() {
    db.collection('forum').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            communityGrid.innerHTML = "";
            if (snapshot.empty) return;
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const post = doc.data(); const postId = doc.id;
                const upvotesArray = post.upvotes || []; const commentsArray = post.comments || [];
                const hasUpvoted = currentUid ? upvotesArray.includes(currentUid) : false;

                const postCard = document.createElement('div');
                postCard.className = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 h-full";
                const isOwner = currentUid === post.authorUid;
                const displayName = post.isAnonymous ? "Anonymous Homie" : (post.authorName || "Homie");
                let postAvatar = post.isAnonymous ? `<div class="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold"><i data-lucide="eye-off" class="w-4 h-4"></i></div>` : `<div class="w-9 h-9 rounded-full ${getAvatarColorClass(displayName)} text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">${displayName.charAt(0)}</div>`;

                let commentsHtml = "";
                commentsArray.forEach(cmt => {
                    commentsHtml += `<div class="bg-slate-50 rounded-xl p-3 text-xs border border-slate-100"><span class="font-bold text-slate-800 block mb-0.5">${cmt.authorName}</span><p class="text-slate-600 leading-relaxed">${cmt.content}</p></div>`;
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
                        <p class="text-xs text-slate-600 leading-relaxed font-medium">${post.content}</p>
                    </div>
                    <div class="pt-3 border-t border-slate-100 space-y-4">
                        <div class="flex items-center gap-4 text-xs">
                            <button onclick="toggleUpvote('${postId}', '${hasUpvoted}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${hasUpvoted ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}"><i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i> <span>${upvotesArray.length}</span></button>
                            <button onclick="document.getElementById('commentThread-${postId}').classList.toggle('hidden')" class="bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> ${commentsArray.length} Replies</button>
                        </div>
                        <div id="commentThread-${postId}" class="hidden space-y-3 pt-2">
                            <div class="space-y-2 max-h-48 overflow-y-auto">${commentsHtml || '<p class="text-[11px] text-slate-400 text-center italic py-2">No response context logged.</p>'}</div>
                            <div class="flex gap-2"><input type="text" id="commentInput-${postId}" placeholder="Write a reply..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-300 focus:bg-white transition"><button onclick="submitComment('${postId}')" class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition">Reply</button></div>
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
        comments: firebase.firestore.FieldValue.arrayUnion({ authorUid: user.uid, authorName: user.displayName.split(' ')[0], content: input.value.trim(), createdAt: Date.now() })
    }).then(() => input.value = "");
};

communityForm.addEventListener('submit', (e) => {
    e.preventDefault(); const currentUser = auth.currentUser; if (!currentUser) return;
    db.collection('forum').add({ authorUid: currentUser.uid, authorName: currentUser.displayName, content: document.getElementById('postContent').value, isAnonymous: document.getElementById('postAnonymous').checked, upvotes: [], comments: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => communityForm.reset());
});

window.deleteForumPost = function(postId) { if (confirm("Delete post?")) db.collection('forum').doc(postId).delete(); };

// --- MARKETPLACE ENGINE ---
marketForm.addEventListener('submit', (e) => {
    e.preventDefault(); const currentUser = auth.currentUser; if (!currentUser) return;
    db.collection('listings').add({ sellerUid: currentUser.uid, sellerName: currentUser.displayName, sellerEmail: currentUser.email, title: document.getElementById('itemTitle').value, category: document.getElementById('itemCategory').value, price: document.getElementById('itemPrice').value, description: document.getElementById('itemDescription').value, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => { marketForm.reset(); marketModal.classList.add('hidden'); });
});

function listenToMarketplace() {
    db.collection('listings').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            marketplaceGrid.innerHTML = "";
            if (snapshot.empty) return;
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const item = doc.data(); const listingId = doc.id;
                const isOwner = currentUid === item.sellerUid;
                const itemCard = document.createElement('div');
                itemCard.className = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between";

                itemCard.innerHTML = `
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <span class="${getCategoryBadgeStyle(item.category)} text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">${item.category}</span>
                            <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">${item.price}</span>
                        </div>
                        <h4 class="font-extrabold text-slate-900 text-sm mb-1.5 leading-snug tracking-tight">${item.title}</h4>
                        <p class="text-xs text-slate-500 line-clamp-3 mb-4 bg-slate-50 border border-slate-100 p-2.5 rounded-xl italic">"${item.description}"</p>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                        <div class="text-[11px] text-slate-400">By: <span class="font-semibold text-slate-600">${item.sellerName ? item.sellerName.split(' ')[0] : 'Homie'}</span></div>
                        <div class="flex items-center gap-2">
                            ${isOwner ? `<button onclick="deleteListing('${listingId}')" class="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] px-3 py-2 rounded-xl transition flex items-center gap-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</button>` : `<button onclick="window.openMarketplaceChat('${item.sellerUid}', '${item.sellerName}', '${item.title.replace(/'/g, "\\'")}')" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3 py-2 rounded-xl shadow-sm transition flex items-center gap-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i> Chat</button>`}
                        </div>
                    </div>
                `;
                marketplaceGrid.appendChild(itemCard);
            });
            lucide.createIcons();
        });
}

window.deleteListing = function(id) { if (confirm("Delete listing?")) db.collection('listings').doc(id).delete(); };

// Initialize System Engine
listenToStudentNetwork();