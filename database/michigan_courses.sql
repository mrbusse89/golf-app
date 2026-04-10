-- Michigan Lower Peninsula Golf Courses + Wellen Park FL
-- Run after initial seed to add additional courses

-- Add unique constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_name_key') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_name_key UNIQUE (name);
  END IF;
END $$;

INSERT INTO courses (name, city, state, par, holes, slope_rating, course_rating, yardage) VALUES
-- Traverse City / Northern Lower Peninsula
('Grand Traverse Resort (The Bear)', 'Acme', 'MI', 72, 18, 146, 75.4, 7065),
('Grand Traverse Resort (The Wolverine)', 'Acme', 'MI', 72, 18, 137, 73.8, 7064),
('Torch Golf Club', 'Acme', 'MI', 72, 18, 150, 76.1, 7078),
('A-Ga-Ming Golf Resort (Torch)', 'Kewadin', 'MI', 72, 18, 136, 73.1, 6901),
('Shanty Creek (The Legend)', 'Bellaire', 'MI', 72, 18, 137, 73.1, 6764),
('Shanty Creek (Cedar River)', 'Bellaire', 'MI', 72, 18, 139, 73.9, 6987),
('Crystal Downs Country Club', 'Frankfort', 'MI', 70, 18, 141, 72.5, 6518),
('The Kingsley Club', 'Kingsley', 'MI', 72, 18, 133, 72.8, 6926),
('Mistwood Golf Club', 'Lake Ann', 'MI', 72, 18, 132, 72.5, 6831),
('Belvedere Golf Club', 'Charlevoix', 'MI', 72, 18, 134, 72.8, 6743),
('Crooked Tree Golf Club', 'Petoskey', 'MI', 71, 18, 133, 72.3, 6583),
('True North Golf Club', 'Harbor Springs', 'MI', 72, 18, 141, 74.3, 7002),
('Boyne Highlands (The Heather)', 'Harbor Springs', 'MI', 72, 18, 142, 75.2, 7218),
('Boyne Highlands (Arthur Hills)', 'Harbor Springs', 'MI', 72, 18, 140, 74.8, 7312),
('Boyne Highlands (The Moor)', 'Harbor Springs', 'MI', 72, 18, 134, 72.6, 7019),
('Boyne Mountain (Alpine)', 'Boyne Falls', 'MI', 72, 18, 136, 73.5, 7017),
('Boyne Mountain (Monument)', 'Boyne Falls', 'MI', 72, 18, 131, 71.8, 6811),
('Hidden River Golf & Casting Club', 'Brutus', 'MI', 72, 18, 133, 72.0, 6805),
('Black Lake Golf Club', 'Onaway', 'MI', 72, 18, 141, 74.5, 7044),
('Lakewood Shores (Gailes)', 'Oscoda', 'MI', 72, 18, 137, 73.6, 6954),
('Lakewood Shores (Blackshire)', 'Oscoda', 'MI', 72, 18, 132, 72.1, 6907),

-- Central Lower Peninsula
('Tullymore Golf Resort', 'Stanwood', 'MI', 72, 18, 143, 74.3, 7088),
('St. Ives Golf Club', 'Stanwood', 'MI', 72, 18, 135, 72.3, 6702),
('Pilgrim''s Run Golf Club', 'Pierson', 'MI', 72, 18, 139, 73.8, 7064),
('Gull Lake View (Stoatin Brae)', 'Augusta', 'MI', 72, 18, 139, 74.1, 7104),
('Gull Lake View (Bedford Valley)', 'Augusta', 'MI', 72, 18, 134, 72.8, 6803),
('Eagle Eye Golf Club', 'Bath', 'MI', 72, 18, 142, 74.5, 7114),
('Hawk Hollow Golf Course', 'Bath', 'MI', 72, 18, 137, 73.2, 6850),
('Timber Ridge Golf Club', 'East Lansing', 'MI', 72, 18, 134, 72.5, 6527),
('The Fortress Golf Course', 'Frankenmuth', 'MI', 72, 18, 139, 73.5, 6813),

-- Grand Rapids / West Michigan
('Thousand Oaks Golf Club', 'Grand Rapids', 'MI', 72, 18, 146, 75.7, 7300),
('Egypt Valley Country Club', 'Ada', 'MI', 72, 18, 143, 74.5, 7101),
('Thornapple Pointe Golf Club', 'Grand Rapids', 'MI', 72, 18, 135, 72.8, 6907),
('Railside Golf Club', 'Byron Center', 'MI', 72, 18, 130, 71.5, 6647),
('The Meadows at GVSU', 'Allendale', 'MI', 71, 18, 131, 71.8, 6777),
('Wuskowhan Players Club', 'West Olive', 'MI', 72, 18, 138, 73.8, 6959),

-- Detroit Metro / Southeast Michigan
('Oakland Hills (South)', 'Bloomfield Hills', 'MI', 72, 18, 155, 77.2, 7395),
('Oakland Hills (North)', 'Bloomfield Hills', 'MI', 72, 18, 139, 73.6, 7001),
('Country Club of Detroit', 'Grosse Pointe Farms', 'MI', 72, 18, 140, 73.8, 6876),
('Shepherd''s Hollow Golf Club', 'Clarkston', 'MI', 72, 18, 146, 75.6, 7234),
('Pine Knob Golf Club', 'Clarkston', 'MI', 72, 18, 133, 72.2, 6601),
('Indianwood Golf & CC (Old)', 'Lake Orion', 'MI', 70, 18, 141, 73.5, 6903),
('TPC Michigan', 'Dearborn', 'MI', 72, 18, 140, 74.0, 7082),
('Fieldstone Golf Club', 'Auburn Hills', 'MI', 72, 18, 138, 73.5, 7014),
('Boulder Pointe Golf Club', 'Oxford', 'MI', 72, 18, 136, 73.0, 6918),
('Moose Ridge Golf Course', 'South Lyon', 'MI', 72, 18, 140, 73.9, 7025),
('University of Michigan Golf Course', 'Ann Arbor', 'MI', 71, 18, 135, 72.4, 6637),
('Eagle Crest Golf Club', 'Ypsilanti', 'MI', 72, 18, 132, 71.8, 6708),
('Stonebridge Golf Club', 'Ann Arbor', 'MI', 72, 18, 138, 73.2, 6951),

-- Kalamazoo / Southwest Michigan
('Yarrow Golf & Conference Resort', 'Augusta', 'MI', 72, 18, 130, 71.2, 6428),
('The Moors Golf Club', 'Portage', 'MI', 72, 18, 131, 71.5, 6580),
('Binder Park Golf Club', 'Battle Creek', 'MI', 72, 18, 129, 71.0, 6467),

-- Saginaw / Bay City / Midland
('The Dream at West Branch', 'West Branch', 'MI', 72, 18, 130, 72.0, 6768),
('Snow Snake Ski & Golf', 'Harrison', 'MI', 72, 18, 128, 70.8, 6400),
('Currie Municipal Golf Course (West)', 'Midland', 'MI', 72, 18, 130, 71.5, 6620),

-- Wellen Park, Florida
('Wellen Park Golf & Country Club', 'Venice', 'FL', 72, 18, 142, 73.8, 6968)
ON CONFLICT (name) DO NOTHING;
