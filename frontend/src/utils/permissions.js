export const getPermissions = (user, topicId, authorId = null) => {
  if (!user)
    return { canDelete: false, canLock: false, isMod: false, isAdmin: false };

  // Global Admin
  if (user.is_staff) {
    return {
      canDelete: true,
      canLock: true,
      isMod: true,
      isAdmin: true,
      isGlobalAdmin: true,
    };
  }

  const modRecord = user.moderated_topics?.find((m) => m.topic_id === topicId);
  const isAdmin = modRecord?.role === 'admin';
  const isMod = modRecord?.role === 'mod' || isAdmin;

  return {
    isMod: isMod,
    isAdmin: isAdmin,
    canDelete: isMod || (authorId && user.id === authorId),
    canLock: isMod,
    canPromote: isAdmin,
  };
};
