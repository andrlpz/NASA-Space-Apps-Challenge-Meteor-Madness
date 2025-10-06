import React from 'react';
import RangeSlider from './RangeSlider';
import { useTranslation } from 'react-i18next'
import InfoButton from './info';

const Sliders = ({ diameter, setDiameter, velocity, setVelocity }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-3 sm:p-4 lg:p-5 border border-gray-700 flex flex-col">
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-3 sm:mb-4 text-center">
                {t('adjust_parameters')}
            </h2>
            <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="group">
                    <p className="text-xs sm:text-sm lg:text-base font-semibold text-white mb-2 flex items-center">
                        {t('diameter')}
                        <InfoButton term="diameter" />
                    </p>
                    <RangeSlider min={0} max={1000} step={10} value={diameter} onChange={setDiameter} />
                </div>
                <div className="group">
                    <p className="text-xs sm:text-sm lg:text-base font-semibold text-white mb-2 flex items-center">
                        {t('velocity_km_s')}
                        <InfoButton term="velocity" />
                    </p>
                    <RangeSlider min={12} max={72} step={1} value={velocity} onChange={setVelocity} />
                </div>
            </div>
            <div className="mt-3 sm:mt-4 lg:mt-6 text-xs text-gray-400 text-center">
                {t('slide_to_simulate')}
            </div>
        </div>
    );
}

export default Sliders;