import { useState } from "react";
import './register.css';

export default function RegisterModal() {
  const [step, setStep] = useState(1);
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    hobbies: [],
    avatar: null,
    bio: ""
  });

  const next = () => setStep(step + 1);
  const prev = () => setStep(step - 1);

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("username", formData.username);
    data.append("password", formData.password);
    data.append("hobbies", JSON.stringify(formData.hobbies));
    data.append("bio", formData.bio);
    if (formData.avatar) data.append("avatar", formData.avatar);

    try {
        const res = await fetch("http://localhost:3007/api/register", {
          method: "POST",
          body: data,
        });

        const result = await res.json();

        if (res.ok) {
          setMessage("Registration succesfull! 🎉");
        } else {
          setMessage(`Error: ${result.error}`);
        }
      } catch (err) {
        setMessage("Server error.Try again later");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="modal-wrapper">
      <div className="modal">
      {step === 1 && (
        <>
          <h2>Step 1: Login & Password</h2>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button onClick={next}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Step 2: Select hobbies</h2>
          {["Music", "Sports", "Programming", "Gaming"].map((hobby) => (
            <label key={hobby}>
              <input
                type="checkbox"
                checked={formData.hobbies.includes(hobby)}//если выбранное хобби уже есть в массиве formData.hobbies,чекбокс будет отмечен
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      hobbies: [...formData.hobbies, hobby]
                    });
                  } else {
                    setFormData({
                      ...formData,
                      hobbies: formData.hobbies.filter((h) => h !== hobby)
                    });
                  }
                }}
              />
              {hobby}
            </label>
          ))}
          <button onClick={prev}>Back</button>
          <button onClick={next}>Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Step 3: Upload avatar</h2>
          <input
            type="file"
            onChange={(e) =>
              setFormData({ ...formData, avatar: e.target.files[0] })
            }
          />
          <button onClick={prev}>Back</button>
          <button onClick={next}>Next</button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Step 4: Bio</h2>
          <textarea
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
          />
          <button onClick={prev}>Back</button>
          <button onClick={handleSubmit}>Finish</button>
        </>
      )}

      {loading && <p>Загрузка...</p>}
      {message && <p className="message">{message}</p>}

    </div>
    </div>
  );
}
