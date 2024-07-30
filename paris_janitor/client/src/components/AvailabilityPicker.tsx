import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AvailabilityPickerProps {
    availabilityDates: Date[];
    setAvailabilityDates: React.Dispatch<React.SetStateAction<Date[]>>;
}

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({ availabilityDates, setAvailabilityDates }) => {
    return (
        <div>
            <label>unavailability Dates:</label>
            <DatePicker
                selected={null}
                onChange={date => {
                    if (date && !availabilityDates.some(d => d.toDateString() === date.toDateString())) {
                        setAvailabilityDates([...availabilityDates, date]);
                    }
                }}
                inline
            />
            <div>
                {availabilityDates.map((date, index) => (
                    <span key={index} style={{ marginRight: '5px' }}>{date.toDateString()}</span>
                ))}
            </div>
        </div>
    );
};

export default AvailabilityPicker;
