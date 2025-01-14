import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserData, setLocations } from '../../store/appSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { Autocomplete } from '@react-google-maps/api';

const defaultLocation = { lat: 25.2048, lng: 55.2708 }; // Default to Dubai

function AddLocationPage() {
    const [position, setPosition] = useState(defaultLocation);
    const [address, setAddress] = useState('');
    const [gLocation, setGlocation] = useState()
    const [tag, setTag] = useState('');
    const [autocomplete, setAutocomplete] = useState(null);
    const userData = useSelector(selectUserData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData | userData == null) {
            navigate("/auth")
        }
    }, [])

    const handleSubmit = async () => {
        if (!position.lat || !position.lng) {
            toast.error('Please select a location on the map.');
            return;
        }
        if (!address) {
            toast.error('Please enter an address.');
            return;
        }
        if (!tag) {
            toast.error('Please enter a tag.');
            return;
        }

        // Create the location object
        // const data = {
        //     id: Date.now(), // Unique identifier for the location
        //     lat: position.lat,
        //     lng: position.lng,
        //     address,
        //     tag,
        // };

        const data = {
            "token": userData.data.auth_token,
            "user_id": userData.data.id,
            "latitude": position.lat,
            "longitude": position.lng,
            "address": gLocation?.formatted_address,
            "house": address,
            "tag": tag,
            "get_only_default_address": "get_only_default_address"
        }

        console.log('Dispatching location data:', data); // Debugging
        // dispatch(setLocations(data)); // Ensure this sends the correct payload
        try {
            const response = await axios.post('https://lewoffy.infineur.com/public/api/save-address', data);
            console.log('Location added successfully:', response.data);
            toast.success('Location added successfully!');
            setAddress('');
            setTag('');
            navigate(-1); // Navigate after successful submission
        } catch (error) {
            console.error('Error adding location:', error);
            toast.error('Failed to adding location. Please try again.');
        }
    };



    return (
        <div className="relative">
            <div className="sticky top-0 left-0 w-full z-10">
                <MapComponent position={position} setPosition={setPosition} defaultLocation={defaultLocation} setAutocomplete={setAutocomplete} autocomplete={autocomplete} gLocation={gLocation} setGlocation={setGlocation} />
            </div>
            <section className="sticky mt-5 bg-white text-center p-3 rounded-t-xl text-black z-50">
                <div className="flex flex-col gap-2">
                    <span className="text-md text-start pb-1 pt-3">Place and Address</span>
                    <textarea
                        className="textarea min-w-full bg-white text-black border-gray-200"
                        placeholder="Enter your place and address for delivery"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <span className="text-md text-start pb-1 pt-3">Place tag</span>
                    <input value={tag} type='text' onChange={(e) => setTag(e.target.value)} className="input min-w-full bg-white text-black border-gray-200" placeholder="Example: Home, Office, etc" />
                </div>
                <button onClick={() => handleSubmit()} className="btn bg-main-color w-full mt-5">Add Address</button>
            </section>
            <ToastContainer />
        </div>
    );
}

export default AddLocationPage;
