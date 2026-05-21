const INTERNAL_SYSTEM_EMAILS = [
  "admin@intentedge.ai",
  "investor@intentedge.ai"
];

const isInternalUser = (email) => {
  if (!email) return false;
  return INTERNAL_SYSTEM_EMAILS.includes(email.toLowerCase());
};

module.exports = {
  INTERNAL_SYSTEM_EMAILS,
  isInternalUser
};
