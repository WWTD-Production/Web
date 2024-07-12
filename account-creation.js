document.addEventListener("DOMContentLoaded", function() {
    const createAccountButton = document.getElementById('create-account');
    const googleSignUpButton = document.getElementById('google-sign-up');
    const facebookSignUpButton = document.getElementById('facebook-sign-up');

    createAccountButton.addEventListener('click', createAccount);
    googleSignUpButton.addEventListener('click', googleSignUp);
    facebookSignUpButton.addEventListener('click', facebookSignUp);

    document.getElementById('error-message').style.display = "none"
});

function createAccount() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Account creation successful
            console.log("Account created successfully", userCredential.user);
            checkOrCreateUser(userCredential.user)

        })
        .catch((error) => {
            errorMessage.textContent = error.message;  // Show error to user
            console.error("Error creating account:", error);
        });
}

function googleSignUp() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Google sign-in successful", result.user);
            // Redirect or handle user data
            checkOrCreateUser(result.user)
        })
        .catch((error) => {
            document.getElementById('error-message').textContent = error.message;
            console.error("Error with Google sign-in:", error);
        });
}

function facebookSignUp() {
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Facebook sign-in successful", result.user);
            // Redirect or handle user data
            checkOrCreateUser(result.user)

        })
        .catch((error) => {
            document.getElementById('error-message').textContent = error.message;
            console.error("Error with Facebook sign-in:", error);
        });
}


function checkOrCreateUser(user) {
    var userDB = firebase.firestore();

    userDB.collection('users').doc(user.uid).get().then(function(doc) {
        if (!doc.exists) {
            // If user does not exist, create new user entry in Firestore
            userDB.collection('users').doc(user.uid).set({
                id: user.uid,  // Use user.uid which is guaranteed to be unique
                email: user.email,  // Email from the authentication user object
                name: user.displayName,  // Name from the Google user profile
                availableTokens: 100000  // Default tokens assigned to new users
                // Add other user fields as necessary
            }).then(() => {
                console.log("New user created with UID:", user.uid);
                window.location.href = '/wwtd';

            }).catch(error => {
                console.error("Error creating user:", error);
            });
        } else {
            console.log("User already exists in Firestore:", user.uid);
            window.location.href = '/wwtd';

        }
    }).catch(error => {
        console.error("Error checking user existence:", error);
    });
}