import { Link } from "react-router-dom";

const Careers = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1>Careers</h1>
            <p>At this time, we are not hiring for any positions. Please check back later for any updates.</p>
            <h2>If you are interested in working with us, please <Link to="/contact" className='text-[#4A6FA5]'>contact us</Link>.</h2>

            <p>Unfortunately, we only offer positions within the continental United States. All positions are remote.</p>
        </div>
    );
};

export default Careers;