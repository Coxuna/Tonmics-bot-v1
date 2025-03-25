import { useEffect, useState } from "react";

const AdComponent = () => {
    const [AdController, setAdController] = useState(null);

    useEffect(() => {
        const checkSDK = setInterval(() => {
            if (window.Adsgram) {
                clearInterval(checkSDK); // Stop checking once SDK is available
                const controller = window.Adsgram.init({ blockId: 'int-8626' });
                setAdController(controller);
                console.log("AdsGram SDK initialized successfully!");
            }
        }, 500); // Check every 500ms

        return () => clearInterval(checkSDK); // Cleanup interval on unmount
    }, []);

    const showAd = () => {
        if (AdController) {
            AdController.show()
                .then((result) => {
                    console.log("Ad watched or closed:", result);
                    if (result.done) {
                        alert("You have been rewarded!");
                    }
                })
                .catch((error) => {
                    console.error("Ad error:", error);
                })
                .finally(() => {
                    console.log("Ad interaction completed.");
                });
        } else {
            console.warn("AdsGram SDK not initialized yet.");
            console.log(window)
        }
    };

    return (
        <div>
            <h2>Watch an Ad</h2>
            <button onClick={showAd}>Show Ad</button>
        </div>
    );
};

export default AdComponent;
