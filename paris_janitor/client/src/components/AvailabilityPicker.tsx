import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AvailabilityPickerProps {
    availabilityDates: Date[];
    setAvailabilityDates: React.Dispatch<React.SetStateAction<Date[]>>;
}

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({ availabilityDates, setAvailabilityDates }) => {

    const handleDateChange = (date: Date | null) => {
        if (!date) return;

        const dateString = date.toDateString();
        if (availabilityDates.some(d => d.toDateString() === dateString)) {
            setAvailabilityDates(availabilityDates.filter(d => d.toDateString() !== dateString));
        } else {
            setAvailabilityDates([...availabilityDates, date]);
        }
    };

    return (
        <div>
            <label>Unavailability Dates:</label>
            <DatePicker
                selected={null}
                onChange={handleDateChange}
                inline
                highlightDates={availabilityDates}
            />
            <div>
                {availabilityDates.map((date, index) => (
                    <span key={index} style={{ marginRight: '5px', display: 'inline-block' }}>
                        {date.toDateString()}
                        <button
                            onClick={() => setAvailabilityDates(availabilityDates.filter((_, i) => i !== index))}
                            style={{ marginLeft: '5px', cursor: 'pointer' }}
                        >
                            X
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default AvailabilityPicker;
