
forgotPassword = document.getElementById('forgot-password')
loginButton = document.getElementById("login-button");
errorText = document.getElementById('auth-error-text')

googleLoginButton = document.getElementById('google-login-button')
facebookLoginButton = document.getElementById('facebook-login-button')

createAccount = document.getElementById('create-account-button')

//Initial displays
errorText.style.display = "none"


document.addEventListener("DOMContentLoaded", function() {

    //Set onclick listeners
    loginButton.addEventListener("click", signIn);

    createAccount.addEventListener('click', () => {
        window.location.href = '/create-account';
    });
                                   
    // Auth state changed event
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userDB = firebase.firestore()
            var userID = user.uid
            
            userDB.collection('users').doc(userID).get().then(function(doc) {
                let data = doc.data()
                window.location.href = '/wwtd';
            })
        }
    });
});

                                  

function signIn(){
    userEmail = document.getElementById('email-field').value
    userPassword = document.getElementById('password-field').value
    
    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error){
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("errorCode: " + errorCode +"\n"+ "errorMessage: " + errorMessage)
        
        errorText.style.display = "block"
        if (errorCode == "auth/wrong-password") {
            errorText.innerHTML = "Your password is incorrect"
            
        } else if (errorCode == "auth/too-many-requests") {
            errorText.innerHTML = "Your account has been disabled for too many failed attempts. Please reset your password."
            
        } else {
            errorText.innerHTML = "There was an issue signing in, plese try again later or contact support"

        }
    });
}


// Add this code to your existing script

// Event listener for Google Login Button
googleLoginButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log("Logged in with Google:", user.email);

        // Optional: Check or create a user in your Firestore database
        checkOrCreateUser(user);

        // Redirect user or handle logged in user information here
        window.location.href = '/wwtd';
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Error with Google login", errorCode, errorMessage);

        // Display the error message
        errorText.style.display = "block";
        errorText.innerHTML = errorMessage;
    });
});

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
            }).catch(error => {
                console.error("Error creating user:", error);
            });
        } else {
            console.log("User already exists in Firestore:", user.uid);
        }
    }).catch(error => {
        console.error("Error checking user existence:", error);
    });
}