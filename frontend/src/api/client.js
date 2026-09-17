const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


export class APIError extends Error {

  constructor(
    message,
    status,
    data = null,
  ) {

    super(message);

    this.name =
      "APIError";

    this.status =
      status;

    this.data =
      data;
  }
}


export async function apiRequest(
  path,
  options = {},
) {

  const token =
    localStorage.getItem(
      "fincompliance_token"
    );


  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers || {}),
  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;
  }


  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      }
    );


  let data = null;


  const contentType =
    response.headers.get(
      "content-type"
    );


  if (
    contentType
    &&
    contentType.includes(
      "application/json"
    )
  ) {

    data =
      await response.json();
  }


  if (!response.ok) {

    if (
      response.status === 401
      &&
      !path.includes(
        "/auth/login"
      )
    ) {

      localStorage.removeItem(
        "fincompliance_token"
      );

      localStorage.removeItem(
        "fincompliance_user"
      );


      if (
        window.location.pathname
        !== "/login"
      ) {

        window.location.assign(
          "/login"
        );
      }
    }


    throw new APIError(
      data?.detail
      || `Request failed with status ${response.status}`,

      response.status,

      data,
    );
  }


  return data;
}
