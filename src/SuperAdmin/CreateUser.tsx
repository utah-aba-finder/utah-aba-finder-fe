import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, useEffect,  } from "react";
import { toast } from "react-toastify";

const CreateUser = ({ handleCloseForm }: { handleCloseForm: () => void }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [providerId, setProviderId] = useState("");
    const [role, setRole] = useState("");
    const [hidden, setHidden] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const requestBody = {
            user: {
                email: email,
                password: password,
                provider_id: providerId,
                role: role
            }
        };

        console.log('Creating user with data:', {
            email: email,
            provider_id: providerId,
            role: role,
            password_length: password.length
        });

        const resetForm = () => {
            setEmail("");
            setPassword("");
            setPasswordConfirmation("");
            setProviderId("");
            setRole("provider_admin");
        };

        fetch("https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => {
            console.log('Create user response status:', response.status);
            console.log('Create user response headers:', response.headers);
            
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.error('Create user error response:', errorData);
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                });
            }
            
            return response.json();
        })
        .then(data => {
            console.log('Create user success response:', data);
            toast.success("User created successfully");
            resetForm();
            // Close form only after successful creation
            handleCloseForm();
        })
        .catch(error => {
            console.error("Error creating user:", error);
            toast.error(`Error creating user: ${error.message}`);
            // Don't close form on error so user can fix and retry
        });
    };


  return (
    <div className="flex flex-col bg-white gap-4 p-6">
      <h1 className="text-2xl font-bold text-black-900 mb-6">Create User</h1>
      <form className="flex flex-col gap-4 items-center" onSubmit={handleSubmit}>
        <input 
          className="border border-gray-300 rounded-md p-2 w-1/2" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
        />
        <div className="relative w-1/2">
          <input 
            className="border border-gray-300 rounded-md p-2 w-full" 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password"
          />
          <div
            className="absolute right-2 top-1 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 
              <EyeOffIcon className="w-4 h-4 text-[#4A6FA5]" /> : 
              <EyeIcon className="w-4 h-4 text-[#4A6FA5]" />
            }
          </div>
        </div>
        <div className="relative w-1/2">
          <input 
            className="border border-gray-300 rounded-md p-2 w-full" 
            type={showConfirmPassword ? "text" : "password"} 
            value={passwordConfirmation} 
            onChange={(e) => setPasswordConfirmation(e.target.value)} 
            placeholder="Password Confirmation"
          />
          <div
            className="absolute right-5 top-1 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? 
              <EyeOffIcon className="w-4 h-4 text-[#4A6FA5]" /> : 
              <EyeIcon className="w-4 h-4 text-[#4A6FA5]" />
            }
          </div>
        </div>
        {password !== passwordConfirmation && <p className="text-red-500">Passwords do not match try again</p>}
        <input 
          className="border border-gray-300 rounded-md p-2 w-1/2" 
          type="text" 
          value={providerId} 
          onChange={(e) => setProviderId(e.target.value)} 
          placeholder="Provider ID" 
        />
        <select 
          className="border border-gray-300 rounded-md p-2 w-1/2 c" 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
        >
            <option value="">Select user role...</option>
            <option value="provider_admin">Provider Admin</option>
            <option value="super_admin">Super Admin</option>
        </select>
        <button 
          type="submit" 
          className="bg-[#4A6FA5] text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={password !== passwordConfirmation}
        >
          Create User
        </button>
        <button onClick={handleCloseForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md">Close</button>
      </form>
    </div>
  );
};

export default CreateUser;
