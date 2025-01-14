import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentDeliveryLocation, selectLocations, selectUserData, setCurrentDeliveryLocation } from '../../../store/appSlice';
import axios from 'axios';

function DeliveryLocationCard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const locations = useSelector(selectLocations);
    const currentDeliveryLocation = useSelector(selectCurrentDeliveryLocation);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addresses, setAddresses] = useState()
    const userData = useSelector(selectUserData);
    useEffect(() => {
        const getAddresses = () => {
            const data = {
                "user_id": userData.data.id,
                "token": userData.data.auth_token,
                "restaurant_id": null
            }
            axios.post('https://lewoffy.infineur.com/public/api/get-addresses', data)
                .then((res) => {
                    console.log("Get Address : ", res.data);
                    setAddresses(res.data)
                })
        }
        if (userData?.data?.id) {
            getAddresses()
        }
    }, [])

    const handleChangeLocation = () => {
        setIsModalOpen(true);
    };

    const handleSelectLocation = (location) => {
        dispatch(setCurrentDeliveryLocation(location));
        setIsModalOpen(false);
    };

    const handleAddAddress = () => {
        navigate('/account/add-address');
    };

    return (
        <div>
            {/* Delivery Card */}
            <div className="flex justify-between items-start p-3 bg-gray-200 text-black rounded-lg shadow-sm my-3">
                <div className="flex gap-2">
                    <img
                        src="https://img.freepik.com/free-vector/delivery-man-with-parcel-box-holding-smartphone-with-tracking-number-vector-illustration-flat-cartoon-style_138676-3237.jpg?w=2000"
                        alt="map"
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm pb-1">Delivery to:{currentDeliveryLocation?.tag}</span>
                        <span className="font-extralight text-xs">
                            {currentDeliveryLocation ? currentDeliveryLocation.house : 'No address selected'}
                        </span>
                        {currentDeliveryLocation && (
                            <>
                                <span className="font-extralight text-xs">latitude: {currentDeliveryLocation.latitude}</span>
                                <span className="font-extralight text-xs">longitude: {currentDeliveryLocation.longitude}</span>
                            </>
                        )}
                    </div>
                </div>
                <span className="text-xs text-main-color font-bold text-end cursor-pointer" onClick={handleChangeLocation}>
                    Change
                </span>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 mx-auto bg-black bg-opacity-50 flex items-end max-w-[560px] z-50">
                    <div className="bg-white text-black rounded-t-3xl p-5 min-w-full min-h-[40vh]">
                        <div className='flex justify-between'>
                            <h2 className="text-lg font-semibold mb-4">Select Address</h2>
                            <button
                                onClick={handleAddAddress}
                                className="btn bg-main-color btn-sm text-white py-2 px-4 rounded-lg mb-4 flex items-center gap-2"
                            >
                                <span>Add New</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        </div>
                        {addresses ? (
                            <ul className="space-y-3">
                                {addresses.map((location, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectLocation(location)}
                                        className={`cursor-pointer p-3 bg-gray-100 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-main-color/10 ${currentDeliveryLocation?.id === location.id ? 'border border-main-color' : ''}`}>
                                        <span className="font-medium">{location.tag}</span>
                                        <p className="text-sm">{location.house}</p>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Lat: {location.latitude}, Lng: {location.longitude}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-center w-full text-gray-500">No saved addresses found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeliveryLocationCard;
