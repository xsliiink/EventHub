import type { EventFormData,SocialEvent } from "@shared/types";

interface CreateEventModalProps{
    isOpen: boolean;
    onClose: () => void;


    formData:EventFormData,
    setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;

    step: number,
    setStep: React.Dispatch<React.SetStateAction<number>>;

    hobbies: { id : number, name : string }[];
    hobbiesLoading: boolean;

    isCreating: boolean;
    onSubmit: () => void;

    handleHobbyChange: (hobbyName: string) => void;
}

export default function CreateEventModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    step,
    setStep,
    hobbies,
    hobbiesLoading,
    isCreating,
    onSubmit,
    handleHobbyChange,
}: CreateEventModalProps){

    if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <h3>Create an event (Step {step})</h3>

        {/* STEP 1 */}
        {step === 1 && (
          <div className='step'>
            <input
              type="text"
              placeholder='Event name'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <textarea
              placeholder='Description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <button onClick={() => setStep(step + 1)}>Next</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className='step'>
            {hobbiesLoading && <p>Loading hobbies...</p>}

            {!hobbiesLoading &&
              hobbies.map((hobby) => (
                <label key={hobby.id}>
                  <input
                    type="checkbox"
                    checked={formData.selectedHobbies.includes(hobby.name)}
                    onChange={() => handleHobbyChange(hobby.name)}
                  />
                  {hobby.name}
                </label>
              ))
            }

            <button onClick={() => setStep(step - 1)}>Back</button>
            <button onClick={() => setStep(step + 1)}>Next</button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className='step'>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setFormData({ ...formData, eventImage: file });
              }}
            />

            <button onClick={() => setStep(step - 1)}>Back</button>
            <button onClick={() => setStep(step + 1)}>Next</button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className='step'>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />

            <input
              type="text"
              placeholder='Location'
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />

            <button onClick={() => setStep(step - 1)}>Back</button>

            <button
              onClick={onSubmit}
              disabled={isCreating}
              className={`btn-finish ${isCreating ? 'loading' : ''}`}
            >
              {isCreating ? 'Creating...' : 'Finish'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}