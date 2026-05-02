import os
import camelot
import pandas as pd

from app.config import settings


class TableParser:
    """
    Extract tables from PDF files.
    """

    def __init__(self):

        self.table_dir = settings.TABLES_DIR

        os.makedirs(
            self.table_dir,
            exist_ok=True
        )

    def extract_tables(self, pdf_path):

        """
        Extract tables using Camelot.
        """

        extracted_tables = []

        try:

            tables = camelot.read_pdf(
                pdf_path,
                pages="all"
            )

            for i, table in enumerate(tables):

                file_name = (
                    f"table_{i+1}.csv"
                )

                table_path = os.path.join(
                    self.table_dir,
                    file_name
                )

                table.df.to_csv(
                    table_path,
                    index=False
                )

                extracted_tables.append(
                    table_path
                )

        except Exception as e:

            print(
                f"Table extraction error: {e}"
            )

        return extracted_tables


    def tables_to_text(self):

        """
        Convert tables to text format.
        """

        table_chunks = []

        for file in os.listdir(
            self.table_dir
        ):

            if file.endswith(".csv"):

                path = os.path.join(
                    self.table_dir,
                    file
                )

                df = pd.read_csv(path)

                text = df.to_string()

                table_chunks.append({

                    "content": text,
                    "source": file

                })

        return table_chunks