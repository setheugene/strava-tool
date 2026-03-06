import type { StravaActivity, SplitImperial } from '../types/strava';

const METERS_PER_MILE = 1609.34;

function metersToMiles(m: number) {
  return m / METERS_PER_MILE;
}

function paceMinPerMile(speedMs: number): number {
  if (speedMs <= 0) return 999;
  return 1 / (speedMs * 60 / METERS_PER_MILE);
}

function formatPace(speedMs: number): string {
  const minPerMile = paceMinPerMile(speedMs);
  const min = Math.floor(minPerMile);
  const sec = Math.round((minPerMile - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRoast(activity: StravaActivity, splits: SplitImperial[]): string {
  const miles = metersToMiles(activity.distance);
  const avgSpeed = activity.average_speed;
  const avgPaceMin = paceMinPerMile(avgSpeed);
  const stopSec = activity.elapsed_time - activity.moving_time;
  const elevFt = activity.total_elevation_gain * 3.28084;
  const hour = new Date(activity.start_date).getHours();

  // --- Split-based roasts (most specific, prioritized first) ---
  if (splits.length > 1) {
    const paces = splits.map((s) => paceMinPerMile(s.average_speed));
    const slowestIdx = paces.reduce((best, p, i) => (p > paces[best] ? i : best), 0);
    const fastestPace = Math.min(...paces);
    const slowestPace = paces[slowestIdx];
    const mileNum = slowestIdx + 1;

    // One mile is dramatically slower than the rest
    if (slowestPace > fastestPace * 1.3 && splits.length >= 3) {
      const roasts = [
        `Mile ${mileNum} called — it wants its dignity back.`,
        `Wow, took it easy on that mile ${mileNum}, huh? ${formatPace(splits[slowestIdx].average_speed)}/mi is… a choice.`,
        `Mile ${mileNum} was giving "power walk energy." The other miles noticed.`,
        `Something happened at mile ${mileNum}. We're not going to ask. But we noticed.`,
      ];
      return pick(roasts);
    }

    // Last mile is the slowest — faded at the end
    if (splits.length >= 3 && slowestIdx === splits.length - 1 && slowestPace > fastestPace * 1.15) {
      return pick([
        'Strong finish strategy: go out hard, completely fall apart, pray no one checks the splits.',
        `The last mile was your slowest. Classic "I'll pick it up at the end" energy.`,
        'You saved nothing for the finish. Relatable, but we can still judge you.',
      ]);
    }

    // First mile is the slowest — warmed up too late
    if (splits.length >= 3 && slowestIdx === 0 && slowestPace > fastestPace * 1.15) {
      return pick([
        'Your first mile was your slowest. You warmed up by basically shuffling. Respect.',
        'Bold move: save all your speed for miles you\'ve already finished.',
        'Mile 1 was more of a "warm suggestion" than a warm-up.',
      ]);
    }
  }

  // --- Time gap: lots of stopping ---
  if (stopSec > 15 * 60) {
    const stopMin = Math.round(stopSec / 60);
    return pick([
      `You stopped for ${stopMin} minutes. Snack break? Existential crisis? Both?`,
      `${stopMin} minutes of "moving time" that was not moving. We appreciate the honesty.`,
      `Elapsed vs. moving time gap: ${stopMin} min. That's not a run, that's a run with intermissions.`,
    ]);
  }

  // --- Very short distance ---
  if (miles < 1.5) {
    return pick([
      `${miles.toFixed(1)} miles. Bold of you to log that.`,
      `${miles.toFixed(1)} miles? Your Strava app opened by accident and you panicked.`,
      'Your couch and you had a minor disagreement. The couch still won.',
    ]);
  }

  // --- Very long distance ---
  if (miles > 20) {
    return pick([
      'OK, fine. We can\'t roast this one. Genuinely unhinged. We respect it.',
      `${miles.toFixed(0)} miles. We don't know what you're running from, but we hope you got away.`,
      'At this distance, you\'ve earned the right to eat literally whatever you want. Forever.',
    ]);
  }

  // --- Slow overall pace ---
  if (avgPaceMin > 12) {
    return pick([
      `${formatPace(avgSpeed)}/mi average. At that pace, the scenery had time to wave back.`,
      `A ${formatPace(avgSpeed)}/mi pace is technically faster than standing still. Technically.`,
      'That pace says "I showed up" and honestly? That\'s enough. (It\'s not enough.)',
    ]);
  }

  // --- Very fast overall pace ---
  if (avgPaceMin < 6) {
    return pick([
      `Sub-${Math.ceil(avgPaceMin)}-minute miles. Congratulations, we hate you a little.`,
      `${formatPace(avgSpeed)}/mi average. Please go outside and touch grass at normal speed.`,
      'At that pace you were basically a public safety hazard. Impressive and irresponsible.',
    ]);
  }

  // --- Zero kudos ---
  if (activity.kudos_count === 0) {
    return pick([
      'Zero kudos. Not even a pity tap. Your mom must not use Strava.',
      'Zero kudos. Did it even happen? Philosophically speaking?',
      'The internet looked at this run and said: no comment.',
    ]);
  }

  // --- One kudo ---
  if (activity.kudos_count === 1) {
    return pick([
      'One kudo. Someone felt obligated. Probably you.',
      'One kudo. A single soul acknowledged your suffering. Cherish them.',
    ]);
  }

  // --- Very early morning ---
  if (hour < 5) {
    return pick([
      `You ran at ${hour === 0 ? 'midnight' : `${hour}am`}. Insomnia, dedication, or a bet?`,
      `A ${hour}am run. Either very inspiring or a sign something has gone wrong in your life.`,
      'Running before the sun comes up means the sun never saw you fail. Smart.',
    ]);
  }

  // --- Late evening ---
  if (hour >= 21) {
    return pick([
      `A ${hour === 21 ? '9' : hour === 22 ? '10' : '11'}pm run. You remembered you hadn't exercised yet. We've all been there.`,
      'Running at night: fewer witnesses, same amount of suffering.',
      'Late evening run. Nothing says "I had good intentions all day" like going out at 10pm.',
    ]);
  }

  // --- Completely flat ---
  if (miles > 2 && elevFt < 20) {
    return pick([
      'Completely flat route. Did you run on a treadmill parked outside?',
      'Zero elevation. You ran in a parking lot and we respect the commitment.',
      'That elevation profile is so flat it could be a resting heart rate graph.',
    ]);
  }

  // --- Brutal elevation ---
  if (miles > 0 && elevFt / miles > 200) {
    return pick([
      `${Math.round(elevFt)}ft of elevation gain. That wasn't a run, that was a cry for help.`,
      'That elevation profile looks like your stress levels. Respect and concern in equal measure.',
      `${Math.round(elevFt / miles)}ft per mile of climbing. Your legs called, they filed a complaint.`,
    ]);
  }

  // --- Fallback ---
  return pick([
    `"${activity.name}" — bold name for what the data is showing us.`,
    'Logged and noted. The algorithm has seen better. The algorithm has also seen worse.',
    'You ran. It happened. The Strava servers are not impressed but they are not unkind.',
    'Another one in the books. Your future self will thank you. Your current self is exhausted.',
    'Miles logged, dignity maintained (barely). Keep it up.',
  ]);
}
