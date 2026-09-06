const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem("access_token");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (
    config.body &&
    typeof config.body === "object" &&
    !(config.body instanceof FormData)
  ) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}


export const api = {

  // ==========================================================
  // HEALTH
  // ==========================================================

  getHealth: () =>
    request("/health"),


  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  loginUser: async (email, password) => {
    const formData = new URLSearchParams();

    formData.append(
      "grant_type",
      "password"
    );

    formData.append(
      "username",
      email
    );

    formData.append(
      "password",
      password
    );

    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const data =
      await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.message ||
          `Login failed with status ${response.status}`
      );
    }

    if (data.access_token) {
      localStorage.setItem(
        "access_token",
        data.access_token
      );
    }

    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
    }

    return data;
  },


  registerUser: async ({
    name,
    email,
    password,
    role,
  }) => {
    const params =
      new URLSearchParams();

    params.append(
      "name",
      name
    );

    params.append(
      "email",
      email
    );

    params.append(
      "password",
      password
    );

    params.append(
      "role",
      role
    );

    return request(
      `/auth/register?${params.toString()}`,
      {
        method: "POST",
      }
    );
  },


  getCurrentUser: () =>
    request("/auth/me"),


  // ==========================================================
  // BEEKEEPERS
  // ==========================================================

  getBeekeepers: () =>
    request("/beekeepers/"),

  getBeekeeper: (id) =>
    request(`/beekeepers/${id}`),

  createBeekeeper: (data) =>
    request(
      "/beekeepers/",
      {
        method: "POST",
        body: data,
      }
    ),


  // ==========================================================
  // HIVES
  // ==========================================================

  getHives: (beekeeperId = null) => {
    const query =
      beekeeperId
        ? `?beekeeper_id=${beekeeperId}`
        : "";

    return request(
      `/hives/${query}`
    );
  },

  getHive: (id) =>
    request(`/hives/${id}`),

  createHive: (data) =>
    request(
      "/hives/",
      {
        method: "POST",
        body: data,
      }
    ),

  updateHive: (id, data) =>
    request(
      `/hives/${id}`,
      {
        method: "PUT",
        body: data,
      }
    ),

  deleteHive: (id) =>
    request(
      `/hives/${id}`,
      {
        method: "DELETE",
      }
    ),


  // ==========================================================
  // IOT
  // ==========================================================

  getIoTOverview: () =>
    request("/iot/overview"),

  getLatestReading: (hiveId) =>
    request(
      `/iot/hives/${hiveId}/latest`
    ),

  getReadingHistory: (
    hiveId,
    limit = 20
  ) =>
    request(
      `/iot/hives/${hiveId}/history?limit=${limit}`
    ),

  simulateReading: (hiveId) =>
    request(
      `/iot/hives/${hiveId}/simulate`,
      {
        method: "POST",
      }
    ),


  // ==========================================================
  // AI HEALTH
  // ==========================================================

  getLatestHealthAnalysis: (hiveId) =>
    request(
      `/ai/hives/${hiveId}/health/latest`
    ),

  getHealthHistory: (hiveId) =>
    request(
      `/ai/hives/${hiveId}/health/history`
    ),

  analyzeHiveHealth: (hiveId) =>
    request(
      `/ai/hives/${hiveId}/health/analyze`,
      {
        method: "POST",
      }
    ),

  evaluateHiveHealth: (hiveId) =>
    request(
      `/ai/hives/${hiveId}/health/evaluate`
    ),


  // ==========================================================
  // PRODUCTIVITY AI
  // ==========================================================

  getLatestProductivity: (hiveId) =>
    request(
      `/productivity/hives/${hiveId}/productivity/latest`
    ),

  getProductivityHistory: (hiveId) =>
    request(
      `/productivity/hives/${hiveId}/productivity/history`
    ),

  predictProductivity: (hiveId) =>
    request(
      `/productivity/hives/${hiveId}/productivity/predict`,
      {
        method: "POST",
      }
    ),


  // ==========================================================
  // HONEY QUALITY AI
  // ==========================================================

  getLatestHoneyQuality: (hiveId) =>
    request(
      `/honey-quality/hives/${hiveId}/quality/latest`
    ),

  getHoneyQualityHistory: (hiveId) =>
    request(
      `/honey-quality/hives/${hiveId}/quality/history`
    ),

  analyzeHoneyQuality: (
    hiveId,
    averageTemperature,
    moisturePercent,
    exposureHours
  ) =>
    request(
      `/honey-quality/hives/${hiveId}/quality/analyze` +
        `?average_temperature=${encodeURIComponent(
          averageTemperature
        )}` +
        `&moisture_percent=${encodeURIComponent(
          moisturePercent
        )}` +
        `&exposure_hours=${encodeURIComponent(
          exposureHours
        )}`,
      {
        method: "POST",
      }
    ),


  // ==========================================================
  // HONEY BATCHES
  // ==========================================================

  getHoneyBatches: () =>
    request("/honey-batches/"),

  getHoneyBatch: (id) =>
    request(`/honey-batches/${id}`),

  createHoneyBatch: (data) =>
    request(
      "/honey-batches/",
      {
        method: "POST",
        body: data,
      }
    ),


  // ==========================================================
  // BLOCKCHAIN
  // ==========================================================

  getBlockchainRecords: (batchId) =>
    request(
      `/blockchain/batches/${batchId}/chain`
    ),

  verifyBlockchainBatch: (batchId) =>
    request(
      `/blockchain/batches/${batchId}/verify`
    ),


  // ==========================================================
  // QR CODE
  // ==========================================================

  // Beekeeper only
  generateQRCode: (batchId) =>
    request(
      `/qr/batches/${batchId}/generate`,
      {
        method: "POST",
      }
    ),

  // Beekeeper + Customer
  // Returns an already-generated QR.
  getQRCode: (batchId) =>
    request(
      `/qr/batches/${batchId}`
    ),

  // Public
  verifyQRCode: (token) =>
    request(
      `/qr/verify/${token}`
    ),

  // Public image endpoint
  getQRCodeImage: (token) =>
    `/api/v1/qr/image/${token}`,
};