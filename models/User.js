// google auth 
module.exports = (mongoose) => {
  const User = mongoose.model(
    'User',
    mongoose.Schema(
      {
        googleId: { type: String, unique: true, sparse: true, },
        githubId: { type: String, unique: true, sparse: true, },
        email: { type: String, unique: true, required: true, },
        password: { type: String, unique: true, sparse: true, },
        displayName: { type: String, required: true, default: "CreationGoal User"},
        firstName: { type: String, required: true, default: "CreationGoal"},
        lastName: { type: String, required: true, default: "User"},
        image: { type: String, required: true, default: "https://ibb.co/jTH610t"}, 
        bio: { type: String, },
        location: { type: String, },
        company: { type: String, },
        website: { type: String, },
        createdAt: { type: Date, default: Date.now, }
      }),
    'users'
     )
return User;
};