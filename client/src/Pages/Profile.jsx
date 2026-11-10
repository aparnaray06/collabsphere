import { useEffect, useState } from "react";
import {useAuth} from "../Context/AuthContext"

import authService from "../Services/authService";

export default function Profile(){
    const {user, refreshProfile} = useAuth();

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(()=>{
        setName(user?.name || "");
        setBio(user?.bio || "");

    }, [user]);

    async function handleSubmit(e){
        e.preventDefault();

        if(!name.trim()){
            setError("Name cannot be empty");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");

        try{
            await authService.updateProfile({
                name: name.trim(),
                bio: bio.trim(),
            });
            await refreshProfile();
            setSuccess("Profile updated successfully!");
        }catch(err){
            setError(
                err.response?.data?.message || "Unable to update profile"
            );
        }finally{
            setLoading(false);
        }
    }

    if(!user){
        return <p>Please login to view your profile.</p>;
    }
    return(
        <section className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">ACCOUNT SETTINGS</p>
                    <h1>My Profile</h1>
                </div>
            </div>

            <div className="profile-container">
                <div className="profile-info">
                    <div className="profile-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <label>Full Name</label>
                    <input type="text"
                    value={name}
                    onChange={(e)=>setName(e.target.value)} 
                    placeholder="Enter your name"/>

                    <label>Email Address</label>
                    <input type="email"
                    value={user.email}
                    disabled />

                    <label>Bio</label>
                    <textarea 
                    value={bio}
                    onChange={(e)=>setBio(e.target.value)}
                    placeholder="Write something about yourself..." 
                    rows={4}></textarea>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading? "Saving..." :"Save Changes"}
                    </button>
                </form>
            </div>
        </section>
    )
}