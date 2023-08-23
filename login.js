

const form = document.querySelector('.login_form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  // if the form is empty, don't console.log the error

  const identifier = document.querySelector('#identifier').value;
  const password = document.querySelector('#password').value;

  const request_body = {
    identifier: identifier,
    password: password,
  };

  fetch('https://zone01normandie.org/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Set Basic authentication headers with base64 encoding
      'Authorization': `Basic ${btoa(`${identifier}:${password}`)}`,
    },
    body: JSON.stringify(request_body),
  })

    .then((response) => {
      if (response.ok) {
        // Login successful

        return response.json();
      } else {
        // Login failed
        throw new Error('Invalid credentials');
      }
    })
    .then((data) => {
      // Extract the JWT from the response
      const jwt = data;
      //console.log(data);
      // Store the JWT securely (e.g., in local storage)
      localStorage.setItem('jwt', jwt);
      console.log(jwt);
      // redirect to profile page
      window.location.href = "profile.html";

    })

    .catch((error) => {
      // Handle the error by displaying an appropriate error message to the user
      console.error('Login failed:', error);
      // Display an error message on the login form
      const errorElement = document.querySelector('#login_error');
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }
        , 5000);
    });

  const jwt = localStorage.getItem('jwt');

});


/* 
        query: ` 
            query IntrospectionQuery {
              __schema {
                types {
                  name
                  kind
                  description
                  fields {
                    name
                    description
                    type {
                      name
                      kind
                    }
                  }
                }
              }
            }
            `,
          }),
        })
*/