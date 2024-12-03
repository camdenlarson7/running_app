"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import '../globals.css';

interface Run {
  id?: number;
  date: string;
  time_started: string;
  time_ended: string;
  total_time: string;
  distance: string;
  avg_pace: string;
  elevation_gain: string;
  location: string;
  effort_level: number;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [newRun, setNewRun] = useState({
    date: "",
    time_started: "",
    total_time: "",
    distance: "",
    elevation_gain: "",
    location: "track",
    effort_level: 1,
  });
  const [error, setError] = useState<string>("");

  const fetchRuns = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setError("Error fetching user: " + userError.message);
      return;
    }

    const user = userData?.user;
    if (user) {
      const { data, error } = await supabase
        .from(`${user.email}_runs`)
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        setError("Failed to fetch runs: " + error.message);
      } else {
        setRuns(data as Run[]);
      }
    }
  };

  const addRun = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    // Fetch the user first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setError("User not found or error fetching user.");
      return;
    }
    const user = userData.user;

    const { date, time_started, total_time, distance, elevation_gain, location, effort_level } = newRun;

    // Calculate derived values
    const [hours, minutes, seconds] = total_time.split(":").map(Number);
    const totalSeconds = hours * 3600 + minutes * 60 + (seconds || 0);

    // Ensure time_started has a valid format
    const startTimeParts = time_started.split(":");
    const formattedTimeStarted =
      startTimeParts.length === 2 ? `${time_started}:00` : time_started; // Add seconds if missing
    const startTime = new Date(`1970-01-01T${formattedTimeStarted}Z`);
    const endTime = new Date(startTime.getTime() + totalSeconds * 1000)
      .toISOString()
      .substring(11, 19);

    const avgPaceInSeconds = totalSeconds / parseFloat(distance);
    const avgPaceMinutes = Math.floor(avgPaceInSeconds / 60);
    const avgPaceSeconds = Math.round(avgPaceInSeconds % 60);
    const avgPace = `${avgPaceMinutes}:${avgPaceSeconds.toString().padStart(2, "0")}`;

    const newRunData = {
      date,
      time_started,
      time_ended: endTime,
      total_time,
      distance,
      avg_pace: avgPace,
      elevation_gain,
      location,
      effort_level,
    };

    // Perform the insert operation and fetch the inserted data
    const { data, error } = await supabase
      .from(`${user.email}_runs`)
      .insert([newRunData])
      .select(); // Use select() to get the inserted data

    if (error) {
      setError("Failed to add run: " + error.message);
    } else {
      setRuns((prev) => [...prev, ...(data as Run[])]);
      setNewRun({
        date: "",
        time_started: "",
        total_time: "",
        distance: "",
        elevation_gain: "",
        location: "track",
        effort_level: 1,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRun((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // Calculate total statistics
  const totalDistance = runs.reduce((acc, run) => acc + parseFloat(run.distance), 0);
  const totalElevationGain = runs.reduce((acc, run) => acc + parseFloat(run.elevation_gain), 0);
  const totalTimeInSeconds = runs.reduce((acc, run) => {
    const [hours, minutes, seconds] = run.total_time.split(":").map(Number);
    return acc + hours * 3600 + minutes * 60 + (seconds || 0);
  }, 0);

  // Calculate average pace, average run time, and average distance
  const avgPace = runs.reduce((acc, run) => {
    const paceInSeconds = run.avg_pace.split(":").reduce((acc, time) => acc * 60 + parseInt(time), 0);
    return acc + paceInSeconds;
  }, 0) / runs.length;
  const avgPaceMinutes = Math.floor(avgPace / 60);
  const avgPaceSeconds = Math.round(avgPace % 60);
  const averagePace = `${avgPaceMinutes}:${avgPaceSeconds.toString().padStart(2, "0")}`;

  // Ensure avgRunTime is a valid number
  const avgRunTime = totalTimeInSeconds / runs.length;
  const avgRunTimeFormatted = isNaN(avgRunTime) || avgRunTime <= 0
    ? "00:00:00"
    : new Date(avgRunTime * 1000).toISOString().substring(11, 19);

  const avgDistance = totalDistance / runs.length;

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <h1>Brisk: Track Your Runs</h1>
      </header>

      {/* Runs Table with updated styling and the .runs-container class */}
      <div className="runs-container">
        <table className="recent-runs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>Run Time</th>
              <th>Distance (miles)</th>
              <th>Pace (min/mile)</th>
              <th>Elevation (ft)</th>
              <th>Effort (1-10)</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>{run.date}</td>
                <td>{run.time_started}</td>
                <td>{run.total_time}</td>
                <td>{run.distance}</td>
                <td>{run.avg_pace}</td>
                <td>{run.elevation_gain}</td>
                <td>{run.effort_level}</td>
                <td>{run.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-container">
        <div className="stats-column">
          <h2>Total Run Stats</h2>
          <ul>
            <li>Total Distance: {totalDistance.toFixed(2)} miles</li>
            <li>Total Elevation Gain: {totalElevationGain.toFixed(2)} feet</li>
            <li>Total Time: {new Date(totalTimeInSeconds * 1000).toISOString().substring(11, 19)}</li>
          </ul>
        </div>

        <div className="stats-column">
          <h2>Average Run Stats</h2>
          <ul>
            <li>Average Pace: {averagePace}</li>
            <li>Average Run Time: {avgRunTimeFormatted}</li>
            <li>Average Distance: {avgDistance.toFixed(2)} miles</li>
          </ul>
        </div>
      </div>

      {/* Add Run Section */}
      <div className="add-run-container">
        <h2 style={{ color: '#155724' }}>Add Run</h2>
        <form onSubmit={addRun}>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={newRun.date}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Start Time:
            <input
              type="time"
              name="time_started"
              value={newRun.time_started}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Total Time:
            <input
              type="text"
              name="total_time"
              placeholder="hh:mm:ss"
              value={newRun.total_time}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Distance (miles):
            <input
              type="number"
              name="distance"
              step="0.01"
              value={newRun.distance}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Elevation Gain (ft):
            <input
              type="number"
              name="elevation_gain"
              step="0.01"
              value={newRun.elevation_gain}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Location:
            <select
              name="location"
              value={newRun.location}
              onChange={handleInputChange}
            >
              <option value="track">Track</option>
              <option value="road">Road</option>
              <option value="trail">Trail</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>
            Effort Level (1-10):
            <input
              type="number"
              name="effort_level"
              value={newRun.effort_level}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
            />
          </label>
          <button style={{ color: '#1b6b2e',backgroundColor: 'white', fontSize: '20px' }} type="submit">Add Run</button>
        </form>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}


