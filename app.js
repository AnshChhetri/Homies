// 1. Your real, secure keys connected to Google Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfBpznXuifN0FF6i4OPYSPxlgu16ER3gI",
  authDomain: "homies-9d0a5.firebaseapp.com",
  projectId: "homies-9d0a5",
  storageBucket: "homies-9d0a5.firebasestorage.app",
  messagingSenderId: "203127709993",
  appId: "1:203127709993:web:c29a1b36aba3e01dd6d738"
};

// 2. Initialize Firebase Engines (Auth + Firestore Database)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); 
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 3. Grab Interface Elements from HTML
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn'); 
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// Profile Form Elements
const profileModal = document.getElementById('profileModal');
const profileForm = document.getElementById('profileForm');

// Network Feed Elements
const networkGrid = document.getElementById('networkGrid');
const studentCounter = document.getElementById('studentCounter');

// Community Hub Elements
const communityPostBox = document.getElementById('communityPostBox');
const communityForm = document.getElementById('communityForm');
const communityGrid = document.getElementById('communityGrid');

// Marketplace Elements
const openMarketModalBtn = document.getElementById('openMarketModalBtn');
const marketModal = document.getElementById('marketModal');
const closeMarketModalBtn = document.getElementById('closeMarketModalBtn');
const marketForm = document.getElementById('marketForm');
const marketplaceGrid = document.getElementById('marketplaceGrid');

// --- MILESTONE 3 HELPER FUNCTIONS ---

// Helper function to generate a consistent Tailwind background color based on name string
function getAvatarColorClass(name) {
    if (!name) return "bg-blue-600";
    const colors = [
        "bg-blue-600", "bg-emerald-600", "bg-indigo-600", 
        "bg-violet-600", "bg-purple-600", "bg-pink-600", 
        "bg-cyan-600", "bg-teal-600", "bg-orange-600"
    ];
    // Simple hashing algorithm based on character codes
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Helper function to return beautiful color combinations for marketplace categories
function getCategoryBadgeStyle(category) {
    switch(category) {
        case 'Skill Trade':
            return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'Books & Notes':
            return 'bg-purple-50 text-purple-700 border border-purple-200';
        case 'Electronics':
            return 'bg-amber-50 text-amber-700 border border-amber-200';
        default:
            return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
}

// 4. Open and close the authentication modal popups
signInBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

// Open/Close Marketplace Modal
openMarketModalBtn.addEventListener('click', () => {
    marketModal.classList.remove('hidden');
});

closeMarketModalBtn.addEventListener('click', () => {
    marketModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === marketModal) {
        marketModal.classList.add('hidden');
    }
});

// 5. TRIGGER GOOGLE SIGN-IN WHEN CLICKED
googleLoginBtn.addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(result => {
            console.log("Success! Logged in user:", result.user.displayName);
            loginModal.classList.add('hidden'); 
            checkUserProfile(result.user);     
        })
        .catch(error => {
            console.error("Login failed:", error.message);
            alert("Oops! Could not connect to Google. Try again.");
        });
});

// 5.5 TRIGGER LOGOUT WHEN CLICKED
signOutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log("User successfully signed out.");
            alert("You have logged out safely!");
        })
        .catch(error => {
            console.error("Logout failed:", error.message);
        });
});

// 6. FUNCTION TO CHECK IF USER ALREADY HAS A SAVED PROFILE
function checkUserProfile(user) {
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                console.log("Welcome back! Profile already exists in database.");
                profileModal.classList.add('hidden'); 
            } else {
                console.log("New student! Showing profile setup form.");
                profileModal.classList.remove('hidden'); 
            }
        })
        .catch(err => console.error("Error reading database:", err));
}

// 7. SAVE THE PROFILE FORM DATA TO FIRESTORE ON SUBMIT
profileForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const college = document.getElementById('profileCollege').value;
    const major = document.getElementById('profileMajor').value;
    const skills = document.getElementById('profileSkills').value;

    db.collection('users').doc(currentUser.uid).set({
        uid: currentUser.uid,
        fullName: currentUser.displayName,
        email: currentUser.email,
        collegeName: college,
        major: major,
        skills: skills,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Profile successfully saved to Cloud Firestore!");
        profileModal.classList.add('hidden'); 
        alert(`Welcome to Homies, ${currentUser.displayName}! Your profile is now live.`);
    })
    .catch(error => {
        console.error("Error writing document to database: ", error);
        alert("Could not save profile. Try again.");
    });
});

// 8. TRACK LOGGED IN STATE, TOGGLE NAVIGATION BUTTONS & CHECK FOR PROFILE
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User data retrieved:", user.displayName);
        
        signInBtn.innerText = `Hey, ${user.displayName.split(' ')[0]}`;
        signInBtn.classList.remove('bg-blue-600');
        signInBtn.classList.add('bg-emerald-600');
        
        signOutBtn.classList.remove('hidden');
        openMarketModalBtn.classList.remove('hidden');
        communityPostBox.classList.remove('hidden'); 
        
        checkUserProfile(user);
    } else {
        signInBtn.innerText = "Sign In";
        signInBtn.classList.remove('bg-emerald-600');
        signInBtn.classList.add('bg-blue-600');
        
        signOutBtn.classList.add('hidden');
        openMarketModalBtn.classList.add('hidden');
        communityPostBox.classList.add('hidden'); 
        profileModal.classList.add('hidden');
        marketModal.classList.add('hidden');
    }
    
    // Refresh continuous snapshot pipelines
    listenToMarketplace();
    listenToCommunityHub();
});

// 9. REAL-TIME STUDENT DIRECTORY ENGINE
function listenToStudentNetwork() {
    db.collection('users').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            networkGrid.innerHTML = "";
            studentCounter.innerText = `${snapshot.size} Homies Active`;

            if (snapshot.empty) {
                networkGrid.innerHTML = `
                    <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                        <p class="text-slate-500 text-sm font-medium">No student profiles found yet. Be the first to join!</p>
                    </div>
                `;
                return;
            }

            snapshot.forEach(doc => {
                const student = doc.data();
                const studentCard = document.createElement('div');
                studentCard.className = "bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between";
                
                // Milestone 3 Dynamic Color Applied here
                const dynamicBgColor = getAvatarColorClass(student.fullName);

                studentCard.innerHTML = `
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full ${dynamicBgColor} text-white font-bold flex items-center justify-center text-sm uppercase shadow-sm">
                                ${student.fullName ? student.fullName.charAt(0) : 'H'}
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900 leading-tight">${student.fullName || 'Anonymous Homie'}</h4>
                                <p class="text-xs text-blue-600 font-medium">${student.major || 'Undecided'}</p>
                            </div>
                        </div>

                        <div class="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5">
                            📍 <span>${student.collegeName || 'Global Campus'}</span>
                        </div>

                        <div class="mt-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skills to Share:</span>
                            <p class="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2.5 italic">
                                "${student.skills || 'Just exploring!'}"
                            </p>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100">
                        <a href="mailto:${student.email}" class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2 rounded-md transition block text-center">
                            📩 Email to Connect
                        </a>
                    </div>
                `;
                networkGrid.appendChild(studentCard);
            });
        }, error => {
            console.error("Error reading student network feed: ", error);
        });
}

// 9.5 REAL-TIME COMMUNITY FORUM FEED PIPELINE
function listenToCommunityHub() {
    db.collection('forum').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            communityGrid.innerHTML = "";

            if (snapshot.empty) {
                communityGrid.innerHTML = `
                    <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                        <p class="text-slate-500 text-sm font-medium">The discussion board is quiet. Say something first!</p>
                    </div>
                `;
                return;
            }

            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;
                const postCard = document.createElement('div');
                postCard.className = "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between";

                const isOwner = currentUid === post.authorUid;
                
                const displayName = post.isAnonymous ? "Anonymous Homie" : (post.authorName || "Homie");
                const avatarChar = post.isAnonymous ? "👤" : (displayName.charAt(0).toUpperCase());
                
                // Milestone 3 Dynamic Background Color logic applied to Forum Post
                const avatarStyle = post.isAnonymous ? "bg-slate-700 text-base" : `${getAvatarColorClass(displayName)} text-sm uppercase shadow-sm`;

                postCard.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full ${avatarStyle} text-white font-bold flex items-center justify-center">
                                    ${avatarChar}
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-900 text-sm leading-tight">${displayName}</h4>
                                    <p class="text-[10px] text-slate-400 font-medium">Student Post</p>
                                </div>
                            </div>
                            ${post.isAnonymous ? `
                                <span class="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Incognito</span>
                            ` : ""}
                        </div>
                        <p class="text-sm text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed whitespace-pre-wrap mb-2">"${post.content}"</p>
                    </div>
                    
                    ${isOwner ? `
                        <div class="pt-2 flex justify-end">
                            <button onclick="deleteForumPost('${postId}')" class="text-red-500 hover:text-red-700 font-semibold text-[11px] transition">
                                🗑️ Delete Post
                            </button>
                        </div>
                    ` : ""}
                `;
                communityGrid.appendChild(postCard);
            });
        }, err => console.error("Error listening to community hub sync stream:", err));
}

// 9.6 COMPOSING AND SAVING FORUM POSTS
communityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const content = document.getElementById('postContent').value;
    const isAnonymous = document.getElementById('postAnonymous').checked;

    db.collection('forum').add({
        authorUid: currentUser.uid,
        authorName: currentUser.displayName,
        content: content,
        isAnonymous: isAnonymous,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Forum thought posted safely!");
        communityForm.reset(); 
    })
    .catch(err => {
        console.error("Could not upload communication block payload:", err);
        alert("Action interrupted. Try again.");
    });
});

// 9.7 SECURE REMOVAL FORUM POST METHOD
window.deleteForumPost = function(postId) {
    if (!confirm("Are you sure you want to drop this discussion item permanently?")) return;

    db.collection('forum').doc(postId).delete()
        .then(() => console.log("Post dropped out of firestore cloud database map."))
        .catch(err => console.error("Removal failure:", err));
};

// 10. SAVE NEW LISTING TO FIRESTORE
marketForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;
    const description = document.getElementById('itemDescription').value;

    db.collection('listings').add({
        sellerUid: currentUser.uid,
        sellerName: currentUser.displayName,
        sellerEmail: currentUser.email,
        title: title,
        category: category,
        price: price,
        description: description,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Listing successfully published to cloud!");
        marketForm.reset(); 
        marketModal.classList.add('hidden'); 
        alert("Your listing is live on the marketplace!");
    })
    .catch(err => {
        console.error("Listing failed to save:", err);
        alert("Could not post listing. Try again.");
    });
});

// 11. LIVE SYNC ENGINE FOR MARKETPLACE GRID
function listenToMarketplace() {
    db.collection('listings').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            marketplaceGrid.innerHTML = "";

            if (snapshot.empty) {
                marketplaceGrid.innerHTML = `
                    <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                        <p class="text-slate-500 text-sm font-medium">No marketplace listings available right now.</p>
                    </div>
                `;
                return;
            }

            const currentUid = auth.currentUser ? auth.currentUser.uid : null;

            snapshot.forEach(doc => {
                const item = doc.data();
                const listingId = doc.id; 

                const itemCard = document.createElement('div');
                itemCard.className = "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between";

                const isOwner = currentUid === item.sellerUid;
                
                // Milestone 3 Category Style applied here
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
                        <div class="text-[11px] text-slate-400">
                            By: <span class="font-medium text-slate-600">${item.sellerName ? item.sellerName.split(' ')[0] : 'Homie'}</span>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            ${isOwner ? `
                                <button onclick="deleteListing('${listingId}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] px-3 py-1.5 rounded transition">
                                    🗑️ Delete
                                </button>
                            ` : `
                                <a href="mailto:${item.sellerEmail}?subject=Homies%20Marketplace:%20${encodeURIComponent(item.title)}" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] px-3 py-1.5 rounded transition">
                                    Contact Seller
                                </a>
                            `}
                        </div>
                    </div>
                `;
                marketplaceGrid.appendChild(itemCard);
            });
        }, err => console.error("Error reading marketplace feed:", err));
}

// 12. SECURE DELETION ENGINE FOR MARKETPLACE LISTINGS
window.deleteListing = function(listingId) {
    if (!confirm("Are you sure you want to remove this listing? This cannot be undone.")) return;

    db.collection('listings').doc(listingId).delete()
        .then(() => {
            console.log("Document successfully deleted from Firestore!");
            alert("Listing has been successfully removed.");
        })
        .catch(error => {
            console.error("Error removing listing document: ", error);
            alert("Oops! Could not delete this listing. Try again.");
        });
};

// Fire up student directory synchronization instantly!
listenToStudentNetwork();