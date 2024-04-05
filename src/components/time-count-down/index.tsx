"use client";

import { useEffect, useState } from "react";

type Props = {
  fromTime?: Date;
  toTime: Date;
};

const TimeUnit = ({ value }: { value: number }) => {
  return (
    <span className="tabular-nums">{value < 10 ? `0${value}` : value}</span>
  );
};

function timeLeftInSeconds(fromTime: Date, toTime: Date) {
  const value = Math.floor((toTime.getTime() - fromTime.getTime()) / 1000);
  return value > 0 ? value : 0;
}

const TimeCountDown = ({ fromTime = new Date(), toTime }: Props) => {
  // in seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    setTimeLeft(timeLeftInSeconds(fromTime, toTime));

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fromTime, toTime]);

  if (timeLeft <= 0) {
    return (
      <>
        <TimeUnit value={0} />
        <span>:</span>
        <TimeUnit value={0} />
        <span>:</span>
        <TimeUnit value={0} />
      </>
    );
  }

  const roundedDays = Math.floor(timeLeft / (60 * 60 * 24));
  const remainingHours = timeLeft - roundedDays * 60 * 60 * 24;

  const hoursDigit = Math.floor(remainingHours / (60 * 60));
  const remainingMinutes = remainingHours - hoursDigit * 60 * 60;

  const minutesDigit = Math.floor(remainingMinutes / 60);
  const secondsDigit = remainingMinutes - minutesDigit * 60;

  return (
    <>
      <TimeUnit value={roundedDays} />
      <span>(days) - </span>
      <TimeUnit value={hoursDigit} />
      <span>:</span>
      <TimeUnit value={minutesDigit} />
      <span>:</span>
      <TimeUnit value={secondsDigit} />
    </>
  );
};

export default TimeCountDown;
