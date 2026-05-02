class RelationshipExtractor:
    """
    Create relationships
    between entities.
    """

    def __init__(self):
        pass


    def create_relationships(
        self,
        entities
    ):
        """
        Connect entities together.
        """

        relationships = []

        for i in range(
            len(entities)
        ):

            for j in range(
                i + 1,
                len(entities)
            ):

                relationships.append(

                    (
                        entities[i],
                        entities[j]
                    )

                )

        return relationships