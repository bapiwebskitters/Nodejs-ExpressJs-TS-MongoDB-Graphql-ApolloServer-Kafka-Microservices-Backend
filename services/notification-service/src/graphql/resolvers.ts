const notifications: Array<{ id: string; message: string; userId: string }> =
  [];

export const notificationResolvers = {
  Query: {
    notifications: (parent: any, { userId }: { userId: string }) =>
      notifications.filter((n) => n.userId === userId),
  },
  Mutation: {
    sendNotification: (
      parent: any,
      { message, userId }: { message: string; userId: string }
    ) => {
      const notification = {
        id: String(notifications.length + 1),
        message,
        userId,
      };
      notifications.push(notification);
      return notification;
    },
  },
};
