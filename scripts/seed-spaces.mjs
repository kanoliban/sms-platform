import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedSpaces() {
  // Get host users
  const { data: hosts, error: hostsError } = await supabase
    .from('users')
    .select('id, name')
    .in('role', ['host', 'founder'])
    .limit(3);

  if (hostsError) {
    console.error('Error fetching hosts:', hostsError);
    return;
  }

  if (!hosts || hosts.length === 0) {
    console.error('No hosts found');
    return;
  }

  console.log('Found hosts:', hosts.map(h => h.name));

  // Generate dates for next 2 weeks
  const today = new Date();
  const getDate = (daysFromNow) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  };

  const sampleSpaces = [
    {
      host_id: hosts[0].id,
      name: 'Sunday Morning Coffee & Connection',
      description: 'Start your Sunday with meaningful conversations over artisan coffee. We\'ll explore what brings us joy and share stories that matter.',
      tone: 'chill',
      date: getDate(2),
      time: '10:00',
      duration_minutes: 90,
      location_address: '2705 Lyndale Ave S, Minneapolis, MN 55408',
      location_hint: 'Uptown Minneapolis - near the lakes',
      capacity: 6,
      price_cents: 0,
      status: 'open',
      location_revealed: false,
      feedback_requested: false
    },
    {
      host_id: hosts[0].id,
      name: 'Deep Conversations at Dusk',
      description: 'An intimate evening for those who crave meaningful dialogue. We\'ll dive into life\'s big questions - purpose, connection, and what makes us human.',
      tone: 'deep',
      date: getDate(5),
      time: '19:00',
      duration_minutes: 120,
      location_address: '301 4th Ave S, Minneapolis, MN 55415',
      location_hint: 'Downtown - rooftop venue',
      capacity: 8,
      price_cents: 1500,
      status: 'open',
      location_revealed: false,
      feedback_requested: false
    },
    {
      host_id: hosts[Math.min(1, hosts.length - 1)].id,
      name: 'Game Night: Strangers Edition',
      description: 'Board games, card games, and plenty of laughter. Come compete (or cooperate!) with people you\'ve never met. No gaming experience required.',
      tone: 'playful',
      date: getDate(3),
      time: '18:30',
      duration_minutes: 150,
      location_address: '800 Washington Ave N, Minneapolis, MN 55401',
      location_hint: 'North Loop - warehouse district',
      capacity: 12,
      price_cents: 1000,
      status: 'open',
      location_revealed: false,
      feedback_requested: false
    },
    {
      host_id: hosts[Math.min(1, hosts.length - 1)].id,
      name: 'Sunset Walk & Talk',
      description: 'A guided walk around one of Minneapolis\' most beautiful lakes. We\'ll walk, talk, and watch the sunset together. Rain date provided.',
      tone: 'chill',
      date: getDate(7),
      time: '17:30',
      duration_minutes: 90,
      location_address: 'Lake Harriet Bandshell, Minneapolis',
      location_hint: 'Lake Harriet area',
      capacity: 10,
      price_cents: 0,
      status: 'open',
      location_revealed: false,
      feedback_requested: false
    },
    {
      host_id: hosts[Math.min(2, hosts.length - 1)].id,
      name: 'Debate Night: Hot Takes Only',
      description: 'Is a hot dog a sandwich? Should pineapple be on pizza? Bring your most controversial opinions and defend them. All in good fun.',
      tone: 'intense',
      date: getDate(9),
      time: '20:00',
      duration_minutes: 120,
      location_address: '411 2nd Ave N, Minneapolis, MN 55401',
      location_hint: 'Downtown - comedy venue',
      capacity: 16,
      price_cents: 2000,
      status: 'open',
      location_revealed: false,
      feedback_requested: false
    },
    {
      host_id: hosts[0].id,
      name: 'Brunch & Big Dreams',
      description: 'Share your wildest dreams over mimosas and pancakes. A supportive space to voice your ambitions and find unexpected allies.',
      tone: 'playful',
      date: getDate(10),
      time: '11:00',
      duration_minutes: 120,
      location_address: '3749 Nicollet Ave, Minneapolis, MN 55409',
      location_hint: 'South Minneapolis - brunch spot',
      capacity: 8,
      price_cents: 2500,
      status: 'open',
      location_revealed: false,
      feedback_requested: false
    }
  ];

  console.log(`\nInserting ${sampleSpaces.length} sample spaces...`);

  for (const space of sampleSpaces) {
    const { data, error } = await supabase
      .from('spaces')
      .insert(space)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting "${space.name}":`, error.message);
    } else {
      console.log(`✓ Created: "${data.name}" (${data.tone}) on ${data.date}`);
    }
  }

  console.log('\nDone! Check /discover to see the spaces.');
}

seedSpaces();
