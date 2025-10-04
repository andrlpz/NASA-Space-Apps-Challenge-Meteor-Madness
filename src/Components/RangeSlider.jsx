import React, { useState, useEffect, useRef } from "react";

const RangeSlider = ({ min, max, step, value, onChange }) => {
    const [sliderValue, setSliderValue] = useState(value);

    const handleSliderInput = (e) => {
        const val = Number(e.target.value);
        setSliderValue(val);
        if (onChange) onChange(val);
    };

    useEffect(() => {
        setSliderValue(value);
    }, [value]);

    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex flex-row justify-between w-full mb-2">
                <span className="text-xs text-gray-400">{min}</span>
                <span className="text-xs text-gray-400">{max}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={handleSliderInput}
                className="
                    w-full h-2
                    bg-gray-700
                    rounded-lg
                    appearance-none
                    accent-blue-400
                    transition
                "
                style={{
                    boxShadow: "0 0 0 2px #1f2937",
                }}
            />
            <div className="mt-2 text-sm text-blue-300 font-semibold">
                {sliderValue}
            </div>
        </div>
    );
};

export default RangeSlider;