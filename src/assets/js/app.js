// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {Modal} from 'bootstrap/dist/js/bootstrap.bundle.min.js';

(function appHandler() {
    const appealForm = document.getElementById('appealFormModal');
    const successInfo = document.getElementById('successInfoModal');
    const errorInfo = document.getElementById('errorInfoModal');

    const appealFormModal = appealForm ? new Modal(appealForm) : null;
    const successInfoModal = successInfo ? new Modal(successInfo) : null;
    const errorInfoModal = errorInfo ? new Modal(errorInfo) : null;

    (function preFillForm() {
        const subjectSelectBox = document.getElementById('subject');
        const gradeSelectBox = document.getElementById('grade');
        const timeSelectBox = document.getElementById('time');

        if (!subjectSelectBox || !gradeSelectBox || !timeSelectBox) {
            return;
        }

        const submitSubjectElem = document.querySelector('input[name="subject"]');
        const submitGradeElem = document.querySelector('input[name="grade"]');
        const submitTimeElem = document.querySelector('input[name="time"]');

        // initial values
        setTimeout(function () {
            submitSubjectElem.value = document.getElementById('subject').value;
            submitGradeElem.value = document.getElementById('grade').value;
            submitTimeElem.value = document.getElementById('time').value;

            document.getElementById('chosenSubject').innerText = submitSubjectElem.value;
            document.getElementById('chosenGrade').innerText = submitGradeElem.value;
            document.getElementById('chosenTime').innerText = submitTimeElem.value;
        }, 75);

        subjectSelectBox.addEventListener('change', () => {
            const selected = subjectSelectBox.value;
            console.log(`Selected subject: ${selected}`);
            document.getElementById('chosenSubject').innerText = selected;
            submitSubjectElem.value = selected;
        });

        gradeSelectBox.addEventListener('change', () => {
            const selected = gradeSelectBox.value;
            console.log(`Selected grade: ${selected}`);
            document.getElementById('chosenGrade').innerText = selected;
            submitGradeElem.value = selected;
        });

        timeSelectBox.addEventListener('change', () => {
            const selected = timeSelectBox.value;
            console.log(`Selected time: ${selected}`);
            document.getElementById('chosenTime').innerText = selected;
            submitTimeElem.value = selected;
        });

        if (!appealFormModal) {
            console.warn('Form does not exist: appealFormModal');
        }

        appealForm.addEventListener('show.bs.modal', (event) => {
            const isEmpty = !submitSubjectElem.value || !submitGradeElem.value || !submitTimeElem.value;
            const shouldOpen = !isEmpty || confirm('Вы не заполнили все поля. Действительно желаете продолжить?');

            if (!shouldOpen) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    })();

    (function appealFormSubmitHandler() {
        const nameInput = document.getElementById('your-name');
        const emailInput = document.getElementById('your-email');
        const subjectInput = document.getElementById('subject');
        const gradeInput = document.getElementById('grade');
        const timeInput = document.getElementById('time');

        if (!nameInput || !emailInput) {
            return;
        }

        const form = document.getElementById('js-appeal-submit-form');

        if (!form) {
            console.warn('Form does not exist: js-appeal-submit-form');
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            // Create a new FormData object and append the form data to it
            const formData = new FormData();
            formData.append('name', nameInput.value);
            formData.append('email', emailInput.value);
            formData.append('subject', subjectInput.value);
            formData.append('grade', gradeInput.value);
            formData.append('time', timeInput.value);

            // Send a POST request to the API endpoint with the form data
            fetch(form.action, {
                method: form.method || 'POST',
                body: formData
            })
                .then(response => response.json()) // Parse the response as JSON
                .then(data => {
                    // Handle the response data here
                    console.log(data);
                    appealFormModal.hide();
                    successInfoModal.show();
                })
                .catch(error => {
                    // Handle any errors that occur during the request
                    console.error(error);
                    errorInfoModal.show();
                });
        });
    })();

    (function scrollHandler() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();

                const targetElement = document.querySelector(link.getAttribute('href'));
                const distanceToTarget = targetElement.getBoundingClientRect().top;

                window.scrollTo({
                    top: window.pageYOffset + distanceToTarget,
                    behavior: 'smooth'
                });
            });
        });
    })();
})();
