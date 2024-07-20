





document.getElementById('account-column').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
});

var currentUserID = ""
var defaultProfile = "https://firebasestorage.googleapis.com/v0/b/wwjd-c3cdc.appspot.com/o/Assets%2Fdefault_profile.png?alt=media&token=907261a4-de36-495b-ba36-78f23e18137b"
var isSubscribed = false
var tokensRemaining = 0


document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.getElementById('logout-button');
    const profileDiv = document.getElementById('profile-div');
    const accountPhotoContainer = document.getElementById('account-photo-container');
    const accountName = document.getElementById('account-name');
    const accountEmail = document.getElementById('account-email');
    const tokensRemainingText = document.getElementById('tokens-remaining');

    const subscriptionLink = document.getElementById('subscription-link');
    const subscriptionInfoDiv = document.getElementById('subscription-info-div');
    const currentPlan = document.getElementById('current-plan');
    const expirationDate = document.getElementById('expiration-date');

    const contactUs = document.getElementById('contact-us');
    contactUs.addEventListener('click', () => {
        window.location.href = '/contact-us';

    })
    logoutButton.addEventListener('click', logout);

    const shareData = {
        title: "WWJD",
        text: "Check out What Would Jesus Do!",
        url: "https://wwtd.webflow.io/wwtd",
      };
      
      const btn = document.getElementById("share-button");
      
      // Share must be triggered by "user activation"
      btn.addEventListener("click", async () => {
        try {
          await navigator.share(shareData);
          console.log("Shared")
        } catch (err) {
          console.log(`Error: ${err}`);
        }
      });

    subscriptionLink.addEventListener('click', () => {
        window.location.href = '/subscribe';

    })
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log("User is signed in. User ID:", user.uid);
            currentUserID = user.uid;

            fetchMessageThreads(user.uid);
            database.collection('users').doc(currentUserID).onSnapshot(doc => {
                if (!doc.exists) {
                    console.log("No user data found, creating new user.");
                    window.location.href = '/create-account';

                } else {
                    const userData = doc.data();
                    profileDiv.innerHTML = '';
                    accountPhotoContainer.innerHTML = '';

                    createDOMElement('img', 'profile-photo', userData.profilePhoto || defaultProfile, profileDiv);
                    createDOMElement('img', 'account-photo', userData.profilePhoto || defaultProfile, accountPhotoContainer);
                    accountName.textContent = userData.name || 'Welcome!';
                    accountEmail.textContent = userData.email || "We're glad you're here.";
                    
                    if (userData.isSubscribed) {
                        isSubscribed = true;
                        tokensRemainingText.textContent = "∞";
                        subscriptionLink.style.display = "none";
                        subscriptionInfoDiv.style.display = "flex";
                        currentPlan.textContent = "Current Plan: " + (userData.subscriptionType || 'Unlimited');
                        
                        if (userData.subscriptionExpirationDate) {
                            const expirationTimestamp = userData.subscriptionExpirationDate.seconds * 1000;
                            expirationDate.textContent = "Expires: " + formatDate(new Date(expirationTimestamp));
                        } else {
                            expirationDate.textContent = 'No Expiration Date Set';
                        }
                    } else {
                        tokensRemaining = userData.availableTokens
                        tokensRemainingText.textContent = userData.availableTokens ? Math.round(userData.availableTokens / 100).toString() : '0';
                        subscriptionInfoDiv.style.display = "none";
                        subscriptionLink.style.display = "flex";
                    }
                }
            });
        } else {
            window.location.href = '/login';
        }
    });
});


function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function logout() {
    firebase.auth().signOut().then(() => {
        console.log("User signed out");
        window.location.href = '/'
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
}
