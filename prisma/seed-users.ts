import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleUsers = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'alex.chen@example.com',
    username: 'alexchen',
    displayName: 'Alex Chen',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Chen&background=6366f1&color=fff',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'maya.nguyen@example.com',
    username: 'mayanguyen',
    displayName: 'Maya Nguyen',
    avatarUrl: 'https://ui-avatars.com/api/?name=Maya+Nguyen&background=14b8a6&color=fff',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'jordan.lee@example.com',
    username: 'jordanlee',
    displayName: 'Jordan Lee',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jordan+Lee&background=f97316&color=fff',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    email: 'sophia.kim@example.com',
    username: 'sophiakim',
    displayName: 'Sophia Kim',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sophia+Kim&background=ec4899&color=fff',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    email: 'noah.patel@example.com',
    username: 'noahpatel',
    displayName: 'Noah Patel',
    avatarUrl: 'https://ui-avatars.com/api/?name=Noah+Patel&background=22c55e&color=fff',
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    email: 'emma.garcia@example.com',
    username: 'emmagarcia',
    displayName: 'Emma Garcia',
    avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Garcia&background=8b5cf6&color=fff',
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    email: 'liam.smith@example.com',
    username: 'liamsmith',
    displayName: 'Liam Smith',
    avatarUrl: 'https://ui-avatars.com/api/?name=Liam+Smith&background=06b6d4&color=fff',
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    email: 'olivia.brown@example.com',
    username: 'oliviabrown',
    displayName: 'Olivia Brown',
    avatarUrl: 'https://ui-avatars.com/api/?name=Olivia+Brown&background=ef4444&color=fff',
  },
  {
    id: '99999999-9999-4999-8999-999999999999',
    email: 'ethan.wilson@example.com',
    username: 'ethanwilson',
    displayName: 'Ethan Wilson',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ethan+Wilson&background=0ea5e9&color=fff',
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    email: 'ava.martinez@example.com',
    username: 'avamartinez',
    displayName: 'Ava Martinez',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ava+Martinez&background=d946ef&color=fff',
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    email: 'lucas.anderson@example.com',
    username: 'lucasanderson',
    displayName: 'Lucas Anderson',
    avatarUrl: 'https://ui-avatars.com/api/?name=Lucas+Anderson&background=84cc16&color=fff',
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    email: 'mia.thomas@example.com',
    username: 'miathomas',
    displayName: 'Mia Thomas',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mia+Thomas&background=f59e0b&color=fff',
  },
];

async function main() {
  for (const user of sampleUsers) {
    const userMetadata = {
      avatar_url: user.avatarUrl,
      display_name: user.displayName,
      name: user.displayName,
      username: user.username,
    };

    await prisma.$executeRaw(
      Prisma.sql`
        insert into auth.users (
          id,
          aud,
          role,
          email,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) values (
          ${user.id}::uuid,
          'authenticated',
          'authenticated',
          ${user.email},
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          ${JSON.stringify(userMetadata)}::jsonb,
          now(),
          now()
        )
        on conflict (id) do update set
          email = excluded.email,
          raw_user_meta_data = excluded.raw_user_meta_data,
          updated_at = now()
      `,
    );

    await prisma.profile.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      create: user,
    });
  }

  console.log(`Seeded ${sampleUsers.length} sample profiles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
