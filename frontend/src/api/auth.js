const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


export async function loginUser(
  username,
  password,
) {

  const response =
    await fetch(
      `${API_URL}/api/v1/auth/login`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            username,
            password,
          }),
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data?.detail
      || "Login failed."
    );
  }


  return data;
}


export async function getCurrentUser(
  token
) {

  const response =
    await fetch(
      `${API_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  if (!response.ok) {

    throw new Error(
      "Session is no longer valid."
    );
  }


  return response.json();
}
