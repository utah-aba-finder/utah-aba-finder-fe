import { Link } from "react-router-dom";

const Careers = () => {
    return (
        <div className="lg:w-full p-4 flex flex-col items-center justify-center">
            <h1 className="text-xxl font-bold text-[#4A6FA5]">Careers</h1>
            <p className="text-lg">At this time, we are not hiring for any positions. Please check back later for any updates.</p>
            <h2 className="text-lg">If you are interested in volunteering to help us expand our directory, please <Link to="/contact" className='text-[#4A6FA5]'>contact us</Link>.</h2>
            <p className="text-lg">Unfortunately, we only offer positions within the continental United States and there are no exceptions. All positions are remote.</p>
        </div>
    );
};

export default Careers;