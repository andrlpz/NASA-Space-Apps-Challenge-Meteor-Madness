import React from 'react';
import RangeSlider from './RangeSlider';
import { useTranslation } from 'react-i18next'

const Sliders = ({ diameter, setDiameter, velocity, setVelocity }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-5 border border-gray-700 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
                {t('adjust_parameters')}
            </h2>
            <div className="flex-1 space-y-8">
                <div>
                    <p className="text-base font-semibold text-white mb-2">
                        {t('diameter')}
                    </p>
                    <RangeSlider min={0} max={1000} step={10} value={diameter} onChange={setDiameter} />
                </div>
                <div>
                    <p className="text-base font-semibold text-white mb-2">
                        {t('velocity_km_s')}
                    </p>
                    <RangeSlider min={12} max={72} step={0} value={velocity} onChange={setVelocity} />
                </div>
            </div>
            <div className="mt-6 text-xs text-gray-400 text-center">
                {t('slide_to_simulate')}
            </div>
        </div>
    );
}

export default Sliders;