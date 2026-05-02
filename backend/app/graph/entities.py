import re


class EntityExtractor:
    """
    Extract entities from text
    using simple NLP rules.
    """

    def __init__(self):
        pass


    def extract_entities(self, text):
        """
        Extract capitalized words
        as entities.
        """

        if not text:
            return []

        # Find capitalized words

        words = re.findall(
            r'\b[A-Z][a-zA-Z]+\b',
            text
        )

        # Remove duplicates

        entities = list(set(words))

        return entities


    def extract_from_chunks(self, chunks):
        """
        Extract entities from all chunks.
        """

        all_entities = []

        for chunk in chunks:

            text = chunk.get(
                "content",
                ""
            )

            entities = self.extract_entities(
                text
            )

            all_entities.extend(
                entities
            )

        return list(set(all_entities))