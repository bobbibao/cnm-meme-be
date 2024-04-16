//auth token we will use to generate a meeting and connect to it
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI3MTE2MzY4ZS01ZDU1LTRjYjYtYmYzZC0yNTk0YmU3OTFlMDgiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcxMjc0MzA5NSwiZXhwIjoxNzEyODI5NDk1fQ.YO4u3EqaNyYONSH297yXXbBNb3ymbB6dCCOzL6J-phY";

// API call to create meeting
const createMeeting = async () => {
  // try {
  //   const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
  //     method: "POST",
  //     headers: {
  //       authorization: `${token}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({}),
  //   });
  //   if (!res.ok) {
  //     throw new Error("Failed to create meeting");
  //   }
  //   const { roomId } = await res.json();
  //   return roomId;
  // } catch (error) {
  //   console.error("Error creating meeting:", error);
  //   throw error;
  // }
  return null;
};

module.exports = {
  createMeeting,
};
