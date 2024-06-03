import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

const baseURL = process.env.REACT_APP_API_URL;

function App() {
  
  const [description, setDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [eventID, setEventID] = useState(null);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${baseURL}/events`);
      const eventsWithIST = response.data.events
      setEventsList(eventsWithIST);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events. Please try again later.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e, field) => {
    if (field === 'desc') {
      setDescription(e.target.value);
    } else {
      setEditDescription(e.target.value);
    }
  };

  const toggleEdit = (event) => {
    setEventID(event.id);
    setEditDescription(event.description);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/event/${id}`);
      const updatedList = eventsList.filter(event => event.id !== id);
      setEventsList(updatedList);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again later.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/event`, { description });
      const eventWithIST = response.data;
      setEventsList([...eventsList, eventWithIST]);
      setDescription("");
    } catch (err) {
      console.error("Error adding event:", err);
      setError("Failed to add event. Please try again later.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${baseURL}/event/${eventID}`, { description: editDescription });
      const updatedEvent = response.data.event;
      const updatedEventList = eventsList.map(event =>
        event.id === eventID ? { ...event, description: updatedEvent.description } : event
      );
      setEventsList(updatedEventList);
      setEventID(null);
      setEditDescription("");
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event. Please try again later.");
    }
  };

  return (
    <div className='App'>
      <section>
        <form onSubmit={handleSubmit}>
          <label htmlFor='description'>Description</label>
          <input
            onChange={(e) => handleChange(e, 'desc')}
            type='text'
            name='description'
            id='description'
            placeholder='Describe the event'
            value={description}
            required
          />
          <button type='submit'>Submit</button>
        </form>
      </section>
      {error && <div className="error">{error}</div>}
      <section>
          <table>
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventsList.map((event,index) => (
              
                event.id === eventID ? (
                  <tr key={event.id}>
                    <td>{index + 1}</td>
                    <td><input
                          onChange={(e) => handleChange(e, 'edit')}
                          type='text'
                          name='editDescription'
                          id='editDescription'
                          value={editDescription}
                          required
                        />
                    </td>
                    <td>{event.Created_at !== "Invalid date" ? event.Created_at : "Invalid date"}</td>
                    <td>
                      <button onClick={handleEditSubmit}>Submit</button>
                    </td>
                  </tr>
                ):(
                  <tr key={event.id}>
                    <td>{index + 1}</td>
                    <td>{event.description}</td>
                    <td>{event.Created_at !== "Invalid date" ? event.Created_at : "Invalid date"}</td>
                    <td>
                      <button onClick={() => toggleEdit(event)}>Edit</button>
                      <button onClick={() => handleDelete(event.id)}>Delete</button>
                    </td>
                  </tr>
                )
              
            ))}
          </tbody>
        </table>
        
      </section>
    </div>
  );
}

export default App;
