package pl.org.nowoczesnapolska;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.graphics.Paint.Join;
import android.opengl.Visibility;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListView;

public class Catalogue extends Activity {
	static final private int MENU_SIGNIN = Menu.FIRST;
	static final private int MENU_SETTINGS = Menu.FIRST+1;	
	static final private int MENU_ABOUT = Menu.FIRST+2;
	SQLiteDatabase db;
	public ArrayList<CatalogueEntry> searchList;
	Context ctx;
	public static ListView lv;
	public CatalogueAdapter adapter;
	int first = 1;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.catalogue);
        
        ctx = this;
        lv = (ListView) findViewById(R.id.catalogueListView);
        final EditText search = (EditText) findViewById(R.id.catalogueSearch);
        final EditText prompt = (EditText) findViewById(R.id.cataloguePrompt);
        
		CatalogueDbHelper dbHelper = new CatalogueDbHelper(ctx);
		db = dbHelper.getWritableDatabase();
        searchList = new ArrayList();
        lv.setTextFilterEnabled(true);

        lv.setOnItemClickListener(new OnItemClickListener() {
        	@Override
        	public void onItemClick(AdapterView<?> parent, View view,
              int position, long id) {
        		Log.d("selected id", id+"");
        		Log.d("selected id", this+"");
        		Log.d("selected type", searchList.get(position).getType()+"");
        		Log.d("selected name", searchList.get(position).getName()+"");
        		Intent selectedIntent = new Intent(ctx, CatalogueItem.class);
        		selectedIntent.putExtra("id", id);
        		selectedIntent.putExtra("type", searchList.get(position).getType());
        		startActivity(selectedIntent);
        	}
        });
                
        search.addTextChangedListener(new TextWatcher() {
			@Override
			public void onTextChanged(CharSequence s, int start, int before, int count) {
				if(s.toString().length() > 1) {
					lv.setVisibility(0); // == VISIBLE
					
					String[] filter = new String[2];
					String term = s.toString()+"%";
					Log.d("char str:",term);
					filter[0] = term;
					filter[1] = term;
					Cursor cur = db.rawQuery("select name, id, type from (select title as name, id, 0 as type from books where title like '"+term+"%' UNION ALL select name, id, 1 as type from tags where name like '"+term+"%') order by name", null);
					cur.moveToFirst();
					int i = 0;
					searchList.clear();
					while(i < cur.getCount()){						
						try {
							Log.d("query result", cur.getString(0));
							searchList.add(new CatalogueEntry(cur.getInt(2), cur.getInt(1), cur.getString(0)));
						} catch (Exception e) {
							Log.d("query result count", cur.getColumnCount() + " " + cur.getPosition());
						}
						cur.moveToNext();
						i++;
						Log.d("test listy ctx", ctx.toString());
						Log.d("test listy r.", R.layout.catalogue_list_item+"");
						Log.d("test listy list", searchList.size() + "");
						Log.d("test listy lv", lv.toString());
					}
					if(searchList.size() > 0) {
						if(first == 1) {
							adapter = new CatalogueAdapter(ctx, R.layout.catalogue_row, searchList);
							lv.setAdapter(adapter);
							first = 0;
						}
						adapter.notifyDataSetChanged();
					}
				}  else {
					searchList.clear();
					if(adapter != null) {
						adapter.notifyDataSetChanged();
					}
				}
			}
			
			@Override
			public void beforeTextChanged(CharSequence s, int start, int count,
					int after) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void afterTextChanged(Editable s) {
				// TODO Auto-generated method stub
				
			}
		});        


			Cursor c = db.rawQuery("select id from tags limit 2", null);// do zmiany
			Log.d("db", c.getCount()+"");
			
			/* this is memory consuming and should be optimized. it is first-run only, though */
			if(c.getCount() == 0) {
		        AssetManager assetManager = getAssets();
		        try {
					Log.d("assets", assetManager.list("/assets").length+"");
					for(String s: assetManager.list("/assets")){
						Log.d("assets", s);
					}
					InputStream is = assetManager.open("catalogue.jpg", AssetManager.ACCESS_BUFFER);
					String catalogueString = readInputStreamAsString(is);
					JSONObject jObject = null;
					try {
						//new JSONOBj
						jObject = new JSONObject(catalogueString);
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					Log.d("assets", catalogueString.length()+"");	
					JSONObject added = jObject.getJSONObject("added");
					JSONArray books = added.getJSONArray("books"); // books
					JSONArray tags = added.getJSONArray("tags"); // tags
					
					Log.d("json array books length", books.length()+"");
					Log.d("json array tags length", tags.length()+"");
					Log.d("json array length", added.length()+"");
					
					for(int i = 0; i < books.length(); i++){
						JSONObject book = books.getJSONObject(i);
						Log.d("json-test", book.get("id").toString() + book.get("title").toString() + book.get("slug").toString());  								
								// JSONException						
						ContentValues bookMap = new ContentValues();
						bookMap.put("id", book.get("id").toString());
						bookMap.put("title", book.get("title").toString());
						bookMap.put("slug", book.get("slug").toString());
						bookMap.put("epub", "epub");
						bookMap.put("html", "html");
						bookMap.put("mp3", "mp3");
						
						long id = db.insert("books", null, bookMap);
						Log.d("sql", id+"");
					}

					for(int i = 0; i < tags.length(); i++){
						JSONObject tag = tags.getJSONObject(i);						
						Log.d("json-test", tag.get("id").toString() + tag.get("name").toString() + tag.get("slug").toString()+ tag.get("sort_key").toString()+ tag.get("category").toString());  								
								// JSONException

						//String bookData[] = {book.get("id").toString(), book.get("title").toString(), book.get("slug").toString()};
						ContentValues tagMap = new ContentValues();
						tagMap.put("id", tag.get("id").toString());
						tagMap.put("name", tag.get("name").toString());
						tagMap.put("slug", tag.get("slug").toString());
						tagMap.put("sort_key", tag.get("sort_key").toString());
						tagMap.put("category", tag.get("category").toString());
						tagMap.put("description", "description");
						long id = db.insert("tags", null, tagMap);
						Log.d("sql", id+"");
					}					
					
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
			}

    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
    	super.onCreateOptionsMenu(menu);

    	int groupId;
    	int menuItemId;
    	int menuItemOrder;
    	int menuItemText;

    	// settings
    	groupId = 0;
    	menuItemId = MENU_SIGNIN;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_signin;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	
    	// settings
    	groupId = 0;
    	menuItemId = MENU_SETTINGS;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_settings;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);    	
    	
    	// about
    	groupId = 0;
    	menuItemId = MENU_ABOUT;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_about;
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	    	
    	return true;
    }
    
    public boolean onOptionsItemSelected(MenuItem item) {
    	super.onOptionsItemSelected(item);
    	switch (item.getItemId()) {
    		case (MENU_SIGNIN):
    			startActivity(new Intent(ctx, SignIn.class));
    			return true;
    		case (MENU_SETTINGS):
    			startActivity(new Intent(ctx, Settings.class));
    			return true;
    		case (MENU_ABOUT):
    			startActivity(new Intent(ctx, About.class));
    			return true;    		
    	}

    	return false;    	
    }
    public static String readInputStreamAsString(InputStream is) 
    throws IOException {
    	
        if (is != null) {
            Writer writer = new StringWriter();

            /* be careful if tempted to change buffer size, OutOfMemory exception is watching you */
            char[] buffer = new char[1024];
            try {
                Reader reader = new BufferedReader(
                        new InputStreamReader(is, "UTF-8"));
                int n;
                while ((n = reader.read(buffer)) != -1) {
                    writer.write(buffer, 0, n);
                }
            } finally {
                is.close();
            }
            return writer.toString();
        } else {        
            return "";
        }    	
    }
    
    
}