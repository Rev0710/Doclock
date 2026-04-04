const LIMITS = {
  bloodPressureReadings: 30,
  labResults: 40,
  medications: 40,
};

function mergeHealthProfile(raw) {
  const empty = {
    heightCm: null,
    weightKg: null,
    weightRecordedAt: null,
    bloodPressureReadings: [],
    labResults: [],
    medications: [],
  };

  if (!raw || typeof raw !== "object") {
    return empty;
  }

  return {
    ...empty,
    heightCm: raw.heightCm != null ? raw.heightCm : null,
    weightKg: raw.weightKg != null ? raw.weightKg : null,
    weightRecordedAt: raw.weightRecordedAt ?? null,
    bloodPressureReadings: Array.isArray(raw.bloodPressureReadings)
      ? raw.bloodPressureReadings
      : [],
    labResults: Array.isArray(raw.labResults) ? raw.labResults : [],
    medications: Array.isArray(raw.medications) ? raw.medications : [],
  };
}

/**
 * Mutates `user.healthProfile` from request body. Returns `{ ok: true }` or `{ ok: false, status, message }`.
 */
function applyHealthRecordBody(user, body) {
  const {
    heightCm,
    weightKg,
    weightRecordedAt,
    bloodPressureReadings,
    labResults,
    medications,
  } = body;

  if (!user.healthProfile) {
    user.healthProfile = {};
  }

  if (heightCm !== undefined) {
    if (heightCm === null || heightCm === "") {
      user.healthProfile.heightCm = null;
    } else {
      const n = Number(heightCm);
      user.healthProfile.heightCm = Number.isFinite(n) ? n : null;
    }
  }

  if (weightKg !== undefined) {
    if (weightKg === null || weightKg === "") {
      user.healthProfile.weightKg = null;
      user.healthProfile.weightRecordedAt = undefined;
    } else {
      const n = Number(weightKg);
      user.healthProfile.weightKg = Number.isFinite(n) ? n : null;
      if (user.healthProfile.weightKg != null) {
        user.healthProfile.weightRecordedAt = weightRecordedAt
          ? new Date(weightRecordedAt)
          : new Date();
      }
    }
  }

  if (bloodPressureReadings !== undefined) {
    if (!Array.isArray(bloodPressureReadings)) {
      return { ok: false, status: 400, message: "bloodPressureReadings must be an array" };
    }
    user.healthProfile.bloodPressureReadings = bloodPressureReadings.slice(
      0,
      LIMITS.bloodPressureReadings
    );
  }

  if (labResults !== undefined) {
    if (!Array.isArray(labResults)) {
      return { ok: false, status: 400, message: "labResults must be an array" };
    }
    user.healthProfile.labResults = labResults.slice(0, LIMITS.labResults);
  }

  if (medications !== undefined) {
    if (!Array.isArray(medications)) {
      return { ok: false, status: 400, message: "medications must be an array" };
    }
    user.healthProfile.medications = medications.slice(0, LIMITS.medications);
  }

  return { ok: true };
}

module.exports = {
  LIMITS,
  mergeHealthProfile,
  applyHealthRecordBody,
};
