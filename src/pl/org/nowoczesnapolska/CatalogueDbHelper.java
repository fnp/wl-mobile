package pl.org.nowoczesnapolska;
import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabase.CursorFactory;
import android.database.sqlite.SQLiteOpenHelper;

public class CatalogueDbHelper extends SQLiteOpenHelper {

	public CatalogueDbHelper(Context context, String name,
		CursorFactory factory, int version) {
		super(context, name, factory, version);
		// TODO Auto-generated constructor stub
	}

	private static final int DATABASE_VERSION = 2;
	private static final String TAGS_TABLE = "tags";
	private static final String BOOKS_TABLE = "books";

	private static final String TAGS_TABLE_CREATE =
	                "CREATE TABLE " + TAGS_TABLE + " (" +
	                "id INTEGER, " +
	                "name TEXT, " +
	                "slug TEXT, " +
	                "sort_key TEXT, " +
	                "category TEXT, " +
	                "description TEXT " +
	                ");";

	private static final String BOOKS_TABLE_CREATE =
        "CREATE TABLE " + BOOKS_TABLE + " (" +
        "id INTEGER, " +
        "title TEXT, " +
        "slug TEXT, " +
        "epub TEXT, " +
        "html TEXT, " +
        "mp3 TEXT " +
        ");";
	private static final String DATABASE_NAME = "wl-mobile";

    CatalogueDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }	
	
	@Override
	public void onCreate(SQLiteDatabase db) {
	        db.execSQL(BOOKS_TABLE_CREATE);
	        db.execSQL(TAGS_TABLE_CREATE);
	}

		@Override
	public void onUpgrade(SQLiteDatabase arg0, int arg1, int arg2) {
			// TODO Auto-generated method stub			
	}
}