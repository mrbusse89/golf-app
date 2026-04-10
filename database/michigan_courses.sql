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
('Harbor Shores Golf Club', 'Benton Harbor', 'MI', 71, 18, 137, 73.5, 6800),
('Point O''Woods Golf & CC', 'Benton Harbor', 'MI', 71, 18, 142, 74.5, 6939),
('Hawkshead Golf Links', 'South Haven', 'MI', 72, 18, 130, 71.5, 6568),
('American Dunes Golf Club', 'Grand Haven', 'MI', 72, 18, 143, 75.0, 7217),

-- Saginaw / Bay City / Midland
('The Dream at West Branch', 'West Branch', 'MI', 72, 18, 130, 72.0, 6768),
('Snow Snake Ski & Golf', 'Harrison', 'MI', 72, 18, 128, 70.8, 6400),
('Currie Municipal Golf Course (West)', 'Midland', 'MI', 72, 18, 130, 71.5, 6620),

-- Northern LP Additional
('Crystal Mountain (Mountain Ridge)', 'Thompsonville', 'MI', 72, 18, 137, 73.5, 7003),
('Manistee National (Canthooke Valley)', 'Manistee', 'MI', 72, 18, 133, 72.8, 6916),
('LochenHeath Golf Club', 'Williamsburg', 'MI', 72, 18, 140, 74.0, 7002),
('Highpointe Golf Club', 'Williamsburg', 'MI', 72, 18, 135, 72.5, 6869),
('Elk Ridge Golf Club', 'Atlanta', 'MI', 72, 18, 134, 72.8, 7012),
('The Natural at Beaver Creek', 'Gaylord', 'MI', 72, 18, 134, 72.2, 6860),
('Otsego Club (The Classic)', 'Gaylord', 'MI', 72, 18, 133, 72.5, 6828),
('Garland Lodge (Fountains)', 'Lewiston', 'MI', 72, 18, 138, 73.5, 6968),
('Garland Lodge (Swampfire)', 'Lewiston', 'MI', 72, 18, 137, 73.2, 6954),

-- Southeast Michigan Additional (Oakland County)
('Cherry Creek Golf Club', 'Shelby Township', 'MI', 72, 18, 130, 72.5, 6900),
('Greystone Golf Club', 'Washington', 'MI', 72, 18, 133, 72.8, 6861),
('The Orchards Golf Club', 'Washington', 'MI', 72, 18, 139, 73.9, 7036),
('Lyon Oaks Golf Club', 'Wixom', 'MI', 72, 18, 138, 73.5, 6975),
('Northville Hills Golf Club', 'Northville', 'MI', 72, 18, 139, 73.5, 7003),
('Links of Novi', 'Novi', 'MI', 72, 18, 128, 71.5, 6773),
('Prestwick Village Golf Club', 'Highland', 'MI', 72, 18, 140, 74.0, 7007),
('Mystic Creek Golf Club', 'Milford', 'MI', 72, 18, 132, 71.8, 6631),
('Dunham Hills Golf Club', 'Hartland', 'MI', 72, 18, 131, 72.3, 6816),
('The Majestic at Lake Walden', 'Hartland', 'MI', 72, 18, 137, 73.2, 6905),
('Coyote Golf Club', 'New Hudson', 'MI', 72, 18, 134, 72.8, 6864),
('Tam O''Shanter Country Club', 'West Bloomfield', 'MI', 72, 18, 141, 74.2, 7025),
('Shenandoah Golf & Country Club', 'West Bloomfield', 'MI', 72, 18, 132, 72.0, 6721),
('Bay Pointe Golf Club', 'West Bloomfield', 'MI', 71, 18, 130, 71.8, 6627),
('Franklin Hills Country Club', 'Franklin', 'MI', 72, 18, 138, 73.2, 6825),
('Meadowbrook Country Club', 'Northville', 'MI', 72, 18, 137, 73.1, 6900),
('Great Oaks Country Club', 'Rochester', 'MI', 72, 18, 142, 74.0, 7008),
('WestWynd Golf Course', 'Rochester Hills', 'MI', 72, 18, 125, 70.8, 6400),
('Twin Lakes Golf Club', 'Oakland', 'MI', 71, 18, 130, 71.5, 6507),
('Pontiac Country Club', 'Waterford', 'MI', 72, 18, 132, 72.0, 6800),
('Edgewood Country Club', 'Commerce Township', 'MI', 72, 18, 131, 72.2, 6750),
('Indianwood Golf & CC (New)', 'Lake Orion', 'MI', 72, 18, 139, 73.5, 6910),

-- Southeast Michigan Additional (Wayne County)
('Detroit Golf Club (South)', 'Detroit', 'MI', 72, 18, 125, 69.8, 5967),
('Detroit Golf Club (North)', 'Detroit', 'MI', 72, 18, 138, 73.5, 6920),
('Plum Hollow Country Club', 'Southfield', 'MI', 72, 18, 137, 73.0, 6850),
('Red Run Golf Club', 'Royal Oak', 'MI', 72, 18, 135, 72.5, 6700),
('Fox Hills (Golden Fox)', 'Plymouth', 'MI', 72, 18, 140, 73.8, 7003),
('Fox Hills (Strategic Fox)', 'Plymouth', 'MI', 72, 18, 125, 70.8, 6466),
('Brae Burn Golf Club', 'Plymouth', 'MI', 72, 18, 128, 71.5, 6630),
('Salem Hills Golf Club', 'Northville', 'MI', 72, 18, 130, 71.8, 6698),
('Fellows Creek Golf Club', 'Canton', 'MI', 72, 18, 122, 70.0, 6243),
('Pheasant Run Golf Club', 'Canton', 'MI', 72, 18, 127, 71.2, 6493),
('Hickory Creek Golf Course', 'Canton', 'MI', 72, 18, 125, 70.8, 6394),
('Fox Creek Golf Course', 'Livonia', 'MI', 72, 18, 122, 70.5, 6414),
('Whispering Willows Golf Course', 'Livonia', 'MI', 72, 18, 117, 71.1, 6056),
('Idyl Wyld Golf Course', 'Livonia', 'MI', 70, 18, 113, 68.5, 6002),

-- Southeast Michigan Additional (Macomb County)
('Groesbeck Municipal Golf Course', 'Eastpointe', 'MI', 72, 18, 121, 70.0, 6370),
('Sycamore Hills Golf Club', 'Macomb', 'MI', 72, 18, 130, 71.8, 6628),
('Gowanie Golf Club', 'Harrison Township', 'MI', 72, 18, 129, 71.2, 6512),
('Cracklewood Golf Club', 'Macomb', 'MI', 72, 18, 127, 71.0, 6460),
('Glacier Club', 'Washington', 'MI', 72, 18, 136, 73.0, 6890),

-- Southeast Michigan Additional (Washtenaw / Livingston County)
('Cattails Golf Club', 'South Lyon', 'MI', 72, 18, 126, 70.5, 6403),
('Tanglewood Golf Club', 'South Lyon', 'MI', 72, 18, 133, 72.5, 6845),
('Kensington Metropark Golf Course', 'Milford', 'MI', 71, 18, 123, 72.5, 6624),
('Hudson Mills Metropark Golf Course', 'Dexter', 'MI', 71, 18, 121, 71.5, 6560),
('Travis Pointe Country Club', 'Ann Arbor', 'MI', 72, 18, 142, 74.2, 7053),
('Barton Hills Country Club', 'Ann Arbor', 'MI', 71, 18, 141, 73.8, 6857),
('Polo Fields Golf & CC', 'Ann Arbor', 'MI', 72, 18, 139, 73.8, 7019),
('Lake Forest Golf Club', 'Ann Arbor', 'MI', 72, 18, 126, 71.0, 6508),
('Washtenaw Golf Club', 'Ypsilanti', 'MI', 72, 18, 128, 71.5, 6568),
('Reddeman Farms Golf Club', 'Chelsea', 'MI', 72, 18, 130, 71.8, 6570),
('Pierce Lake Golf Course', 'Chelsea', 'MI', 72, 18, 132, 72.2, 6725),
('The Golf Club at Mt. Brighton', 'Brighton', 'MI', 72, 18, 128, 71.5, 6568),
('Oak Pointe Country Club', 'Brighton', 'MI', 72, 18, 133, 72.5, 6784),
('Chemung Hills Golf Club', 'Howell', 'MI', 72, 18, 130, 71.8, 6650),
('Faulkwood Shores Golf Club', 'Howell', 'MI', 72, 18, 125, 70.5, 6348),
('Marion Oaks Golf Club', 'Howell', 'MI', 72, 18, 124, 70.2, 6302),
('Copper Creek Golf Course', 'Farmington Hills', 'MI', 72, 18, 124, 70.5, 6350),

-- Wellen Park, Florida
('Wellen Park Golf & Country Club', 'Venice', 'FL', 72, 18, 142, 73.8, 6968)
ON CONFLICT (name) DO NOTHING;
