import { auth, firestore } from "./firestore.js"; 
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment 
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";

async function displayRewards() {
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        try {
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const points = Math.min(Math.floor(userData.points || 0), 100); // Cap points at 100
                document.getElementById('points').innerText = points;

                // Update progress bar
                const progressFill = document.getElementById('progress-fill');
                const progressPercentage = (points / 100) * 100;
                progressFill.style.width = `${progressPercentage}%`;

                // Show goal message if points >= 100
                const goalMessage = document.getElementById('goal-message');
                if (points >= 100) {
                    goalMessage.style.display = 'block';
                } else {
                    goalMessage.style.display = 'none';
                }
            } else {
                console.error("No such user document!");
                document.getElementById('points').innerText = '0';
                resetProgressBar();
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            document.getElementById('points').innerText = '0';
            resetProgressBar();
        }
    } else {
        document.getElementById('points').innerText = '0';
        resetProgressBar();
    }
}

function resetProgressBar() {
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('goal-message').style.display = 'none';
}

async function addPointsOnCheckout() {
    const user = auth.currentUser;
    if (user) {
        try {
            const userDocRef = doc(firestore, "users", user.uid);
            await updateDoc(userDocRef, {
                points: increment(20) // Add 20 points
            });

            displayRewards();
            alert("20 points added to your rewards!");
        } catch (error) {
            console.error("Error adding points on checkout:", error);
        }
    } else {
        alert("Please log in to earn rewards points.");
    }
}

function initializeRewards() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            displayRewards();
        } else {
            resetProgressBar();
        }
    });

    // Listen for checkout button click in orders.html
    const checkoutButton = document.querySelector(".btn-success");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", addPointsOnCheckout);
    }

    // Listen for cartTotal updates in local storage
    window.addEventListener("storage", (event) => {
        if (event.key === "cartTotal") {
            updatePoints();
        }
    });
}

initializeRewards();
