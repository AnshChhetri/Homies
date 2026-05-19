const firebaseConfig = {
  apiKey: "AIzaSyDfBpznXuifN0FF6i4OPYSPxlgu16ER3gI",
  authDomain: "homies-9d0a5.firebaseapp.com",
  projectId: "homies-9d0a5",
  storageBucket: "homies-9d0a5.firebasestorage.app",
  messagingSenderId: "203127709993",
  appId: "1:203127709993:web:c29a1b36aba3e01dd6d738"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); 
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Navbar Elements
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn'); 
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// View Containers
const viewHome = document.getElementById('viewHome');
const viewNetwork = document.getElementById('viewNetwork');
const viewCommunity = document.getElementById('viewCommunity');
const viewMarketplace = document.getElementById('viewMarketplace');

// Navigation Buttons
const navHome = document.getElementById('navHome');
const navNetwork = document.getElementById('navNetwork');
const navCommunity = document.getElementById('navCommunity');
const navMarketplace = document.getElementById('navMarketplace');
const navLogo = document.getElementById('navLogo');
const homeExploreBtn = document.getElementById('homeExploreBtn');

// Profile Dashboard Elements
const myProfileSection = document.getElementById('myProfileSection');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileModal = document.getElementById('profileModal');
const profileForm = document.getElementById('profileForm');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');

// Content Feed Node References
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

// --- SINGLE PAGE ROUTER SYSTEM ENGINE ---
function switchView(activeViewName) {
    // 1. Hide all main content panels instantly
    viewHome.classList.add('hidden');
    viewNetwork.classList.add('hidden');
    viewCommunity.classList.add('hidden');
    viewMarketplace.classList.add('hidden');

    // 2. Reset navbar button highlighting rules to default gray text strings
    const buttons = [navHome, navNetwork, navCommunity, navMarketplace];
    buttons.forEach(btn => {
        btn.className = "text-slate-300 hover:text-white transition pb-1 focus:outline-none";
    });

    // 3. Selectively reveal the active panel and light up its navbar text element
    if (activeViewName === 'home') {
        viewHome.classList.remove('hidden');
        navHome.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 focus:outline-none";
        // Hide personal profile container on clean home page view
        myProfileSection.classList.add('hidden');
    } else {
        // Bring back personal profile section when on app data views (if logged in)
        if (auth.currentUser) {
            myProfileSection.classList.remove('hidden');
        }
        
        if (activeViewName === 'network') {
            viewNetwork.classList.remove('hidden');
            navNetwork.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 focus:outline-none";
        } else if (activeViewName === 'community') {
            viewCommunity.classList.remove('hidden');
            navCommunity.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 focus:outline-none";
        } else if (activeViewName === 'marketplace') {
            viewMarketplace.classList.remove('hidden');
            navMarketplace.className = "text-blue-400 font-semibold transition border-b-2 border-blue-400 pb-1 focus:outline-none";
        }
    }
}

// Attach Single-Page Event click managers to navbar tabs
navHome.addEventListener('click', () => switchView('home'));
navNetwork.addEventListener('click', () => switchView('network'));
navCommunity.addEventListener('click', () => switchView('community'));
navMarketplace.addEventListener('click', () => switchView('marketplace'));
navLogo.addEventListener('click', () => switchView('home')); // Logo targets landing homepage
homeExploreBtn.addEventListener('click', () => switchView('network')); // Call to Action routing button

// --- HELPER RENDERING ENGINES ---
function getAvatarColorClass(name) {
    if (!name) return "bg-blue-600";
    const colors = ["bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-violet-600", "bg-purple-600", "bg-pink-600", "bg-cyan-600", "bg-teal-600", "bg-orange-600"];
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

// Auth and Profile Event Managers
signInBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => loginModal.classList.add('hidden'));
editProfileBtn.addEventListener('click', () => populateProfileFormForEditing());
closeProfileModalBtn.addEventListener('click', () => profileModal.classList.add('hidden'));
openMarketModalBtn.addEventListener('click', () => marketModal.classList.remove('hidden'));
closeMarketModalBtn.addEventListener('click', () => marketModal.classList.add('hidden'));

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
    if (e.target === marketModal) marketModal.classList.add('hidden');
    if (e.target === profileModal) profileModal.classList.add('hidden');
});

googleLoginBtn.addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(result => {
            loginModal.classList.add('hidden'); 
            checkUserProfile(result.user);     
        }).catch(() => alert("Could not connect to Google."));
});

signOutBtn.addEventListener('click', () => {
    auth.signOut().then(() => alert("Logged out safely!"));
});

function renderMyShowcaseDashboard(uid) {
    db.collection('users').doc(uid).onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        document.getElementById('myProfileName').innerText = data.fullName || "Student Homie";
        document.getElementById('myProfileHeadline').innerText = `🎓 Studied ${data.major || 'Undecided'} at ${data.collegeName || 'Global Campus'}`;
        document.getElementById('myProfileBio').innerText = data.bio ? `"${data.bio}"` : '"No bio set yet."';

        const avatarBox = document.getElementById('myProfileAvatarBox');
        if (data.photoUrl) {
            avatarBox.innerHTML = `<img src="${data.photoUrl}" class="w-full h-full object-cover">`;
        } else {
            avatarBox.className = `w-28 h-28 rounded-full border-4 border-white ${getAvatarColorClass(data.fullName)} shadow-md flex items-center justify-center text-3xl font-bold text-white uppercase`;
            avatarBox.innerText = data.fullName ? data.fullName.charAt(0) : "H";
        }

        const tagsContainer = document.getElementById('myProfileSkillsTags');
        tagsContainer.innerHTML = "";
        if (data.skills) {
            data.skills.split(',').forEach(skill => {
                if(!skill.trim()) return;
                const span = document.createElement('span');
                span.className = "bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-100";
                span.innerText = skill.trim();
                tagsContainer.appendChild(span);
            });
        }

        const lnk = document.getElementById('myProfileLinkedIn');
        if (data.linkedin) { lnk.href = data.linkedin; lnk.classList.remove('hidden'); } else { lnk.classList.add('hidden'); }
        const gth = document.getElementById('myProfileGitHub');
        if (data.github) { gth.href = data.github; gth.classList.remove('hidden'); } else { gth.classList.add('hidden'); }
    });
}

function populateProfileFormForEditing() {
    const user = auth.currentUser;
    if(!user) return;
    db.collection('users').doc(user.uid).get().then(doc => {
        if(doc.exists) {
            const data = doc.data();
            document.getElementById('profilePhotoUrl').value = data.photoUrl || "";
            document.getElementById('profileCollege').value = data.collegeName || "";
            document.getElementById('profileMajor').value = data.major || "";
            document.getElementById('profileBio').value = data.bio || "";
            document.getElementById('profileSkills').value = data.skills || "";
            document.getElementById('profileLinkedInLink').value = data.linkedin || "";
            document.getElementById('profileGitHubLink').value = data.github || "";
        }
        profileModal.classList.remove('hidden');
    });
}

function checkUserProfile(user) {
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                profileModal.classList.add('hidden'); 
            } else {
                document.getElementById('profilePhotoUrl').value = user.photoURL || "";
                profileModal.classList.remove('hidden'); 
            }
        });
}

profileForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    db.collection('users').doc(currentUser.uid).set({
        uid: currentUser.uid,
        fullName: currentUser.displayName,
        email: currentUser.email,
        photoUrl: document.getElementById('profilePhotoUrl').value || currentUser.photoURL || "",
        collegeName: document.getElementById('profileCollege').value,
        major: document.getElementById('profileMajor').value,
        bio: document.getElementById('profileBio').value,
        skills: document.getElementById('profileSkills').value,
        linkedin: document.getElementById('profileLinkedInLink').value,
        github: document.getElementById('profileGitHubLink').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => profileModal.classList.add('hidden'));
});

// Auth Listener States
auth.onAuthStateChanged(user => {
    if (user) {
        signInBtn.innerText = `Hey, ${user.displayName.split(' ')[0]}`;
        signInBtn.classList.replace('bg-blue-600', 'bg-emerald-600');
        signOutBtn.classList.remove('hidden');
        openMarketModalBtn.classList.remove('hidden');
        communityPostBox.classList.remove('hidden'); 
        
        // Only display profile box if user is currently looking at non-home tabs
        if (!viewHome.classList.contains('hidden')) {
            myProfileSection.classList.add('hidden');
        } else {
            myProfileSection.classList.remove('hidden');
        }
        
        renderMyShowcaseDashboard(user.uid);
    } else {
        signInBtn.innerText = "Sign In";
        signInBtn.classList.replace('bg-emerald-600', 'bg-blue-600');
        signOutBtn.classList.add('hidden');
        openMarketModalBtn.classList.add('hidden');
        communityPostBox.classList.add('hidden'); 
        myProfileSection.classList.add('hidden');
        profileModal.classList.add('hidden');
        marketModal.classList.add('hidden');
    }
    listenToMarketplace();
    listenToCommunityHub();
});

// --- REAL-TIME DATASTREAMS & SYSTEM HOOKS ---

// 1. STUDENT NETWORK STREAM
function listenToStudentNetwork() {
    db.collection('users').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            networkGrid.innerHTML = "";
            studentCounter.innerText = `${snapshot.size} Homies Active`;
            if (snapshot.empty) return;

            snapshot.forEach(doc => {
                const student = doc.data();
                const studentCard = document.createElement('div');
                studentCard.className = "bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between";
                
                let avatarLayout = student.photoUrl ? `<img src="${student.photoUrl}" class="w-10 h-10 rounded-full object-cover shadow-sm">` : `<div class="w-10 h-10 rounded-full ${getAvatarColorClass(student.fullName)} text-white font-bold flex items-center justify-center text-sm uppercase shadow-sm">${student.fullName ? student.fullName.charAt(0) : 'H'}</div>`;

                let skillsChips = "";
                if(student.skills) {
                    student.skills.split(',').forEach(sk => {
                        if(!sk.trim()) return;
                        skillsChips += `<span class="bg-slate-100 text-slate-700 text-[9px] font-medium px-2 py-0.5 rounded">${sk.trim()}</span>`;
                    });
                }

                studentCard.innerHTML = `
                    <div>
                        <div class="flex items-center gap-3 mb-3">
                            ${avatarLayout}
                            <div>
                                <h4 class="font-bold text-slate-900 leading-tight">${student.fullName || 'Anonymous Homie'}</h4>
                                <p class="text-[11px] text-blue-600 font-medium">${student.major || 'Undecided'}</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 font-medium mb-2">📍 ${student.collegeName || 'Global Campus'}</p>
                        <p class="text-xs text-slate-600 line-clamp-2 italic mb-4 bg-slate-50 p-2 rounded border border-slate-100">"${student.bio || 'Hello, lets connect!'}"</p>
                        <div class="space-y-1">
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Skills Inventory:</span>
                            <div class="flex flex-wrap gap-1">${skillsChips || '<span class="text-slate-400 text-xs">Exploring...</span>'}</div>
                        </div>
                    </div>
                    <div class="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                        <a href="mailto:${student.email}" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2 rounded-md transition text-center">📩 Email</a>
                        ${student.linkedin ? `<a href="${student.linkedin}" target="_blank" class="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center text-xs transition">🔗</a>` : ""}
                        ${student.github ? `<a href="${student.github}" target="_blank" class="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center text-xs transition">💻</a>` : ""}
                    </div>
                `;
                networkGrid.appendChild(studentCard);
            });
        });
}

// 2. COMMUNITY HUB STREAM (REWRITTEN WITH LIKES & COMMENTS ENGINE)
function listenToCommunityHub() {
    db.collection('forum').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            communityGrid.innerHTML = "";
            if (snapshot.empty) {
                communityGrid.innerHTML = `<div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 p-6"><p class="text-slate-500 text-sm font-medium">No community posts yet. Be the first to share something!</p></div>`;
                return;
            }
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;
                
                const upvotesArray = post.upvotes || [];
                const commentsArray = post.comments || [];
                const upvoteCount = upvotesArray.length;
                const hasUpvoted = currentUid ? upvotesArray.includes(currentUid) : false;

                const postCard = document.createElement('div');
                postCard.className = "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 h-full";

                const isOwner = currentUid === post.authorUid;
                const displayName = post.isAnonymous ? "Anonymous Homie" : (post.authorName || "Homie");
                let postAvatar = post.isAnonymous ? `<div class="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-base">👤</div>` : `<div class="w-9 h-9 rounded-full ${getAvatarColorClass(displayName)} text-white font-bold flex items-center justify-center text-sm uppercase">${displayName.charAt(0)}</div>`;

                let commentsHtml = "";
                commentsArray.forEach(cmt => {
                    commentsHtml += `
                        <div class="bg-slate-50 rounded-lg p-2.5 text-xs border border-slate-100">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-slate-800">${cmt.authorName}</span>
                                <span class="text-[9px] text-slate-400">Student</span>
                            </div>
                            <p class="text-slate-600">${cmt.content}</p>
                        </div>
                    `;
                });

                postCard.innerHTML = `
                    <div class="space-y-3 flex-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                ${postAvatar}
                                <div>
                                    <h4 class="font-bold text-slate-900 text-sm leading-tight">${displayName}</h4>
                                    <p class="text-[10px] text-slate-400 font-medium">Student Post</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                ${post.isAnonymous ? `<span class="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Incognito</span>` : ""}
                                ${isOwner ? `<button onclick="deleteForumPost('${postId}')" class="text-slate-300 hover:text-red-500 transition text-sm">🗑️</button>` : ""}
                            </div>
                        </div>
                        
                        <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            ${post.content}
                        </p>
                    </div>

                    <div class="pt-3 border-t border-slate-100 space-y-4">
                        <div class="flex items-center gap-4 text-xs">
                            <button onclick="toggleUpvote('${postId}', '${hasUpvoted}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${hasUpvoted ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-transparent'}">
                                🔺 <span>${upvoteCount}</span>
                            </button>
                            
                            <button onclick="document.getElementById('commentThread-${postId}').classList.toggle('hidden')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition">
                                💬 <span>${commentsArray.length} Comments</span>
                            </button>
                        </div>

                        <div id="commentThread-${postId}" class="hidden space-y-3 pt-2 border-t border-slate-100">
                            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                                ${commentsHtml || '<p class="text-[11px] text-slate-400 italic text-center py-2">No comments yet. Start the conversation!</p>'}
                            </div>

                            ${currentUid ? `
                                <div class="flex gap-2 pt-1">
                                    <input type="text" id="commentInput-${postId}" placeholder="Write a reply to your homie..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition">
                                    <button onclick="submitComment('${postId}')" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm">
                                        Reply
                                    </button>
                                </div>
                            ` : `<p class="text-[10px] text-slate-400 text-center italic bg-slate-50 p-2 rounded-lg">Sign in to leave a reply on this post.</p>`}
                        </div>
                    </div>
                `;
                communityGrid.appendChild(postCard);
            });
        });
}

// Global Atomical Upvote Controller 
window.toggleUpvote = function(postId, userHasUpvotedString) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in first to upvote posts!");
        return;
    }

    const postRef = db.collection('forum').doc(postId);
    const isUpvoted = userHasUpvotedString === "true";

    if (isUpvoted) {
        postRef.update({
            upvotes: firebase.firestore.FieldValue.arrayRemove(user.uid)
        });
    } else {
        postRef.update({
            upvotes: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });
    }
};

// Global Atomical Comment Thread Submission Controller
window.submitComment = function(postId) {
    const user = auth.currentUser;
    const inputElement = document.getElementById(`commentInput-${postId}`);
    const textValue = inputElement.value.trim();

    if (!user || !textValue) return;

    const postRef = db.collection('forum').doc(postId);

    postRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion({
            authorUid: user.uid,
            authorName: user.displayName.split(' ')[0], 
            content: textValue,
            createdAt: Date.now()
        })
    }).then(() => {
        inputElement.value = ""; 
    }).catch(err => console.error("Error committing comment update: ", err));
};

// Forum Post Form Submission Handler
communityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    db.collection('forum').add({
        authorUid: currentUser.uid,
        authorName: currentUser.displayName,
        content: document.getElementById('postContent').value,
        isAnonymous: document.getElementById('postAnonymous').checked,
        upvotes: [], 
        comments: [], 
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => communityForm.reset());
});

window.deleteForumPost = function(postId) {
    if (!confirm("Delete this post permanently?")) return;
    db.collection('forum').doc(postId).delete();
};


// 3. MARKETPLACE FEED STREAM
marketForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    db.collection('listings').add({
        sellerUid: currentUser.uid,
        sellerName: currentUser.displayName,
        sellerEmail: currentUser.email,
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        price: document.getElementById('itemPrice').value,
        description: document.getElementById('itemDescription').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        marketForm.reset(); 
        marketModal.classList.add('hidden'); 
    });
});

function listenToMarketplace() {
    db.collection('listings').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            marketplaceGrid.innerHTML = "";
            if (snapshot.empty) {
                marketplaceGrid.innerHTML = `<div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 p-6"><p class="text-slate-500 text-sm font-medium">No marketplace listings available right now.</p></div>`;
                return;
            }
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const item = doc.data();
                const listingId = doc.id; 
                const itemCard = document.createElement('div');
                itemCard.className = "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between";
                const isOwner = currentUid === item.sellerUid;
                const badgeStyle = getCategoryBadgeStyle(item.category);

                itemCard.innerHTML = `
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <span class="${badgeStyle} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">${item.category}</span>
                            <span class="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">${item.price}</span>
                        </div>
                        <h4 class="font-bold text-slate-900 text-base mb-1.5 leading-snug">${item.title}</h4>
                        <p class="text-xs text-slate-600 line-clamp-3 mb-4 bg-slate-50 border border-slate-100 p-2 rounded-lg italic">"${item.description}"</p>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                        <div class="text-[11px] text-slate-400">By: <span class="font-medium text-slate-600">${item.sellerName ? item.sellerName.split(' ')[0] : 'Homie'}</span></div>
                        <div class="flex items-center gap-2">
                            ${isOwner ? `<button onclick="deleteListing('${listingId}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] px-3 py-1.5 rounded transition">🗑️ Delete</button>` : `<a href="mailto:${item.sellerEmail}?subject=Homies%20Marketplace:%20${encodeURIComponent(item.title)}" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] px-3 py-1.5 rounded transition">Contact Seller</a>`}
                        </div>
                    </div>
                `;
                marketplaceGrid.appendChild(itemCard);
            });
        });
}

window.deleteListing = function(listingId) {
    if (!confirm("Are you sure?")) return;
    db.collection('listings').doc(listingId).delete();
};

// Core Execution Hook
listenToStudentNetwork();