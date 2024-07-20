





document.addEventListener('DOMContentLoaded', function() {    
    const yearlyOption = document.getElementById('yearly-option');
    const monthlyOption = document.getElementById('monthly-option');
    const yearlyCheckmark = document.getElementById('yearly-checkmark');
    const monthlyCheckmark = document.getElementById('monthly-checkmark');

    // Define a global property to store the selected subscription type
    let selectedSubscriptionType = 'monthly'; // default to 'monthly'
    let currentUserID = null;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, store the user ID globally
            currentUserID = user.uid;
            initializeSubscriptionOptions();
        } else {
            // No user is signed in, redirect to login page
            window.location.href = '/login';
        }
    });

    function initializeSubscriptionOptions() {
        // Function to update the selection and visual state
        function updateSelection(selectedOption) {
            if (selectedOption === 'yearly') {
                selectedSubscriptionType = 'yearly';
                yearlyOption.className = 'subscription-option';
                monthlyOption.className = 'subscription-option-unselected';
                yearlyCheckmark.className = 'checkmark-selected';
                monthlyCheckmark.className = 'circle-open';
                yearlyCheckmark.innerHTML = '';
                monthlyCheckmark.innerHTML = '';
            } else {
                selectedSubscriptionType = 'monthly';
                yearlyOption.className = 'subscription-option-unselected';
                monthlyOption.className = 'subscription-option';
                yearlyCheckmark.className = 'circle-open';
                monthlyCheckmark.className = 'checkmark-selected';
                monthlyCheckmark.innerHTML = '';
                yearlyCheckmark.innerHTML = '';
            }
        }

        // Attach event listeners to both options
        yearlyOption.addEventListener('click', function() {
            updateSelection('yearly');
        });

        monthlyOption.addEventListener('click', function() {
            updateSelection('monthly');
        });

        // Initialize with the default selection
        updateSelection(selectedSubscriptionType);

        document.getElementById("purchase-button").addEventListener("click", function() {
            fetch('https://wwtd-production-3707e3eba4af.herokuapp.com/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: currentUserID, // Pass the user ID for session creation
                    subscription_type: selectedSubscriptionType
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.url) {
                    window.location.href = data.url;  // Redirect to Stripe Checkout using the URL directly provided by the session
                } else {
                    console.error('Failed to create checkout session:', data.error);
                }
            })
            .catch(error => console.error('Error in creating checkout session:', error));
        });
    }
});