import React, { useState, useEffect } from "react";
import ResponsivePadding from "../shared/ResponsivePadding";
import { useUser } from "../../hooks/UserProvider";

const FriendsSeparator = () => {
  const { user, getReferredUsernames } = useUser();
  const [activeTab, setActiveTab] = useState("referrals");
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferredFriends = async () => {
      if (user && user?.telegram_id) {
        try {
          console.log(user.telegram_id)
          setLoading(true);
          const referredUsers = await getReferredUsernames(user.telegram_id);

          console.log(referredUsers)
          setFriends(referredUsers);
        } catch (error) {
          console.error("Error fetching referred friends:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReferredFriends();
  }, [user]);

  return (
    <ResponsivePadding>
      <div className="text-center p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className={`text-gray-400 font-bold p-2 ${
              activeTab === "referrals" ? "text-white border-b-4 border-teal-400" : ""
            }`}
            onClick={() => setActiveTab("referrals")}
          >
            Friends
          </button>
          <span className="text-white">{friends.length}</span>
        </div>
        {activeTab === "referrals" && (
          <div>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center">
                <img src="/assets/lonely.png" alt="No referrals" className="w-32" />
                <span className="text-white">No referrals yet</span>
              </div>
            ) : (
              <ul className="space-y-4">
                {friends.map((friend, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-blue-900 p-4 rounded-lg shadow-lg text-white"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-black text-white font-semibold uppercase rounded-full mr-3">
                        {friend.referredName.charAt(0)}
                      </div>
                      {friend.referredName}
                    </div>
                    <div className="flex items-center bg-white text-black px-4 py-1 rounded-md shadow">
                      <img src="/assets/token.png" alt="Token" className="w-4 mr-2" />+400
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </ResponsivePadding>
  );
};

export default FriendsSeparator;