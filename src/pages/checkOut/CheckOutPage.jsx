import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import { clearCart, selectCartItems, selectTotalPrice } from '../../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { selectCurrentDeliveryLocation, selectLocations, selectShopData, selectUserData } from '../../store/appSlice';
import { ChevronLeft } from 'lucide-react';

function CheckOutPage() {
    const [selectedOption, setSelectedOption] = useState('');
    const [isOrderSuccess, setIsOrderSuccess] = useState(false); // State for showing the modal
    const defaultLocation = { lat: 25.2048, lng: 55.2708 }; // Default position (UAE: Dubai)
    const [position, setPosition] = useState(defaultLocation);
    const [address, setAddress] = useState('');
    const paymentSectionRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state selectors
    const cartItems = useSelector(selectCartItems);
    const productQuantity = useSelector(selectCartItems);
    const totalPrice = useSelector(selectTotalPrice);
    const userData = useSelector(selectUserData);
    const location = useSelector(selectCurrentDeliveryLocation);

    useEffect(() => {
        if (!userData) {
            navigate('/auth');
        }
    }, [userData, navigate]);

    const paymentMethods = [
        { id: 'COD', status: true, name: 'Cash on Delivery', icon: 'https://img.freepik.com/premium-vector/cash-delivery_569841-164.jpg' },
    ];

    const scrollToPaymentSection = () => {
        paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePlaceOrder = async () => {
        if (!selectedOption) {
            toast.error('Please select a payment method.');
            return;
        }

        // Update placeOrderPerams dynamically
        const updatedOrderDetails = {
            token: userData.data.auth_token,
            user: {
                success: true,
                data: userData.data,
                running_order: null,
                delivery_details: location,
            },
            order: cartItems,
            coupon: null,
            location: {
                lat: location.latitude.toString(),
                lng: location.longitude.toString(),
                address: location.address,
                house: location.house,
                tag: location.tag,
            },
            order_comment: null,
            total: {
                productQuantity: productQuantity,
                totalPrice: totalPrice,
            },
            method: selectedOption,
            payment_token: "",
            delivery_type: 1,
            partial_wallet: false,
            dis: 0,
        };

        // Place order API call
        try {
            const response = await axios.post('https://lewoffy.infineur.com/public/api/place-order', updatedOrderDetails);
            console.log('Order placed successfully:', response.data);
            toast.success('Order placed successfully!');
            setIsOrderSuccess(true); // Show success modal
            dispatch(clearCart());
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        }
    };

    const handleSuccessModalClose = () => {
        setIsOrderSuccess(false);
        navigate('/'); // Redirect to the homepage
    };

    return (
        <div className="relative bg-white text-black">
            {isOrderSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs w-full">
                        <img
                            src="/success-payment-light.gif" // Replace with your success icon image path
                            alt="Success"
                            className="w-20 h-20 mx-auto mb-4"
                        />
                        <h2 className="text-lg font-semibold text-green-600">Payment Success</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Your payment was successful! Just wait for your food to arrive at your home.
                        </p>
                        <div className="space-y-2">
                            <button
                                className="btn bg-main-color w-full"
                                onClick={() => navigate('/account/orders')}
                            >
                                Track Order Now
                            </button>
                            <button
                                className="btn bg-main-color/80 w-full"
                                onClick={handleSuccessModalClose}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-center h-14 w-full sticky top-0 bg-white/60 backdrop-blur-md pt-3 z-40">
                <Link to="/cart">
                    <ChevronLeft className="absolute  left-3 top-6 w-6 h-6" />
                </Link>
                <div className="flex flex-col items-center justify-center">
                    <span className="text-center text-xl font-semibold">
                        Payment
                    </span>
                </div>
            </div>
            <div ref={paymentSectionRef}>
                <section className="bg-white text-center p-3 rounded-t-xl text-black z-40">

                    <h2 className="text-xl text-start font-semibold my-4">Payment</h2>
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`flex items-center p-4 border rounded-xl ${method.status === false ?? 'disabled'}  cursor-pointer ${selectedOption === method.id ? 'border-main-color' : 'border-gray-200'}`}
                                onClick={() => setSelectedOption(method.id)}
                            >
                                <img
                                    src={method.icon}
                                    alt={method.name}
                                    className="w-12 h-12 rounded-xl mr-4 bg-white p-1"
                                />
                                <span className="text-lg font-medium">{method.name}</span>
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method.id}
                                    checked={selectedOption === method.id}
                                    onChange={() => {
                                        if (method.status === true) {
                                            setSelectedOption(method.id);
                                        }
                                    }}
                                    className="ml-auto radio radio-bordered-secondary"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn bg-main-color text-white w-full mt-5"
                        onClick={handlePlaceOrder}
                    >
                        Pay with{' '}
                        {selectedOption
                            ? paymentMethods.find((m) => m.id === selectedOption).name
                            : 'Selected Method'}
                    </button>
                </section>
            </div>
            <ToastContainer />
        </div>
    );
}

export default CheckOutPage;
