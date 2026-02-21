document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section" style="margin-top: 12px;">
            <strong style="color: #1a237e;">Participants:</strong>
            ${details.participants.length > 0 ? `
              <ul class="participants-list" style="margin: 8px 0 0 16px; padding-left: 0; list-style-type: none;">
                ${details.participants.map(email => `
                  <li style='color:#0066cc; margin-bottom:4px; display:flex; align-items:center;'>
                    <span style="flex:1;">${email}</span>
                    <button class="delete-participant" data-activity="${name}" data-email="${email}" title="Remove participant" style="background:none;border:none;color:#c62828;font-size:18px;cursor:pointer;margin-left:8px;">
                      &#x2716;
                    </button>
                  </li>
                `).join('')}
              </ul>
            ` : '<p class="no-participants" style="color:#888; margin:8px 0 0 16px;">No participants yet.</p>'}
          </div>
        `;

        // Add event listeners for delete icons
        setTimeout(() => {
          const deleteButtons = activityCard.querySelectorAll('.delete-participant');
          deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              const activityName = btn.getAttribute('data-activity');
              const email = btn.getAttribute('data-email');
              try {
                const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: 'POST',
                });
                if (response.ok) {
                  fetchActivities(); // Refresh list
                  messageDiv.textContent = 'Participant removed successfully.';
                  messageDiv.className = 'success';
                } else {
                  const result = await response.json();
                  messageDiv.textContent = result.detail || 'Failed to remove participant.';
                  messageDiv.className = 'error';
                }
                messageDiv.classList.remove('hidden');
                setTimeout(() => {
                  messageDiv.classList.add('hidden');
                }, 5000);
              } catch (error) {
                messageDiv.textContent = 'Error removing participant.';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
              }
            });
          });
        }, 0);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Add this line to refresh the activities list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
