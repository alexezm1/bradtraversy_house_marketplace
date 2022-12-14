import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { toast } from "react-toastify";

function Profile() {
  const auth = getAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  const onLogout = (e) => {
    e.preventDefault();
    auth.signOut();
    navigate("/");
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onSubmit = async () => {
    try {
      auth.currentUser.displayName !== name &&
        // Update display name in firebase
        (await updateProfile(auth.currentUser, {
          displayName: name,
        }));

      auth.currentUser.email !== email &&
        (await updateEmail(auth.currentUser, email));

      // Update in database
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name,
        email,
      });
      toast.success("Profile Updated");
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              editMode && onSubmit();
              setEditMode((prevState) => !prevState);
            }}
          >
            {editMode ? "Done" : "Change"}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!editMode ? "profileName" : "profileNameActive"}
              disabled={!editMode}
              value={name}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              className={!editMode ? "profileEmail" : "profileEmailActive"}
              disabled={!editMode}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;
