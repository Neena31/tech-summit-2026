document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageBox = document.getElementById('messageBox');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset message box
        messageBox.classList.add('hidden');
        messageBox.className = 'message-box hidden';
        messageBox.textContent = '';

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Update button state visually
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span>Processing...</span>
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="animation: spin 1s linear infinite; height: 1.25rem; width: 1.25rem;"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        `;

        // Check if style rule for spin exists, if not, add it
        if (!document.getElementById('spinStyle')) {
            const style = document.createElement('style');
            style.id = 'spinStyle';
            style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        try {
            // Send API Request
            // Add a small artificial delay for visual effect of processing
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle Response
            messageBox.classList.remove('hidden');
            
            if (response.ok) {
                messageBox.classList.add('success');
                messageBox.textContent = result.message || 'Registration successfully completed!';
                form.reset(); // clear form inputs
                
                // Change button to success state momentarily
                submitBtn.innerHTML = `
                    <span>Registered</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
                `;
                submitBtn.style.background = '#10b981';
                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    messageBox.classList.add('hidden');
                }, 4000);
            } else {
                throw new Error(result.error || 'Something went wrong during registration.');
            }

        } catch (error) {
            console.error('Submission failed:', error);
            messageBox.classList.remove('hidden');
            messageBox.classList.add('error');
            messageBox.textContent = error.message;
            
            // Revert button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Add playful interactivity on input focus
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const group = input.parentElement;
            group.style.transform = 'translateY(-2px)';
            group.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', () => {
            const group = input.parentElement;
            group.style.transform = 'translateY(0)';
        });
    });
});
