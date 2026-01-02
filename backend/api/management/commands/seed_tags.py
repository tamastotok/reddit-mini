from django.core.management.base import BaseCommand
from api.models import TopicTag, TopicTagCategory

class Command(BaseCommand):
    help = 'Seeds the database with predefined categories and tags'

    def handle(self, *args, **kwargs):
        # A letisztult adatstruktúra
        data = {
            "Gaming": ["FPS", "RPG", "MOBA", "MMORPG", "Indie", "Retro", "Console", "PC Gaming", "E-sports", "Simulation", "Strategy"],
            "Technology": ["Programming", "AI & Machine Learning", "Web Development", "Mobile Dev", "Cybersecurity", "Hardware", "Cloud Computing", "Blockchain", "Data Science", "Open Source"],
            "Science": ["Physics", "Biology", "Astronomy", "Chemistry", "Mathematics", "Neuroscience", "Environment", "Archaeology", "Psychology", "Space Exploration"],
            "Lifestyle": ["Cooking", "Fitness", "Travel", "Fashion", "Health", "DIY", "Gardening", "Personal Finance", "Productivity", "Photography", "Home Decor"],
            "Entertainment": ["Movies", "TV Shows", "Music", "Anime", "Manga", "Books", "Comics", "Podcasts", "Theatre", "Stand-up Comedy"],
            "Social & News": ["Politics", "World News", "Business", "Economics", "Philosophy", "History", "Education", "Current Events", "Debate"],
            "Creative Arts": ["Graphic Design", "Writing", "Painting", "Digital Art", "UI/UX Design", "3D Modeling", "Animation", "Typography", "Crafts"],
            "Sports": ["Football", "Basketball", "Tennis", "Formula 1", "Combat Sports", "Extreme Sports", "Cycling", "Swimming", "Winter Sports", "Hiking"],
            "Meta & Community": ["Support", "Feedback", "Announcements", "Questions", "Discussion", "Off-topic", "Showcase", "Tutorials"]
        }

        self.stdout.write(self.style.SUCCESS('--- Seeding Started ---'))
        
        for cat_name, tags in data.items():
            # Kategória létrehozása vagy lekérése (csak name field van)
            category, created = TopicTagCategory.objects.get_or_create(name=cat_name)
            if created:
                self.stdout.write(f'Created Category: {cat_name}')
            
            for tag_name in tags:
                # Tag létrehozása és összekötése a kategóriával (dropdown logika)
                tag, tag_created = TopicTag.objects.get_or_create(
                    name=tag_name, 
                    category=category
                )
                if tag_created:
                    self.stdout.write(f'  - Created Tag: {tag_name}')
        
        self.stdout.write(self.style.SUCCESS('--- Seeding Finished Successfully ---'))